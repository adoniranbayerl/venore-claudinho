import { authorizeActor, type AuthorizeActorResult } from "@/contexts/rbac";
import type { TicketActorCapabilities } from "../ticket-state";
import {
  findQueueIdByCategoryId,
  findQueueIdsForUser,
  findQueueMemberRole,
  findTicketAuthzInfo,
  type TicketAuthzInfo,
} from "./store";

// Camada de autorização por fila — espelha company-metrics/shared/scoped-authorization/index.ts e
// broadcast/shared/scoped-authorization/index.ts. helpdesk.manage sempre passa (todas as filas,
// ignora atribuição). Quem só tem a permission estreita (helpdesk.work) precisa das DUAS coisas:
// a permission (via papel em /admin/rbac) E uma linha em queue_members com papel suficiente. A
// atribuição sozinha nunca basta.

const FORBIDDEN_QUEUE = {
  code: "helpdesk.queue.forbidden_resource",
  message: "Você só tem acesso às filas atribuídas a você.",
} as const;

// Configurar uma fila (categorias, delegar agentes) = papel "manager" na fila, ou helpdesk.manage.
export async function authorizeQueueConfigActor(queueId: string): Promise<AuthorizeActorResult> {
  const full = await authorizeActor("helpdesk.manage");
  if (full.authorized) return full;

  const scoped = await authorizeActor("helpdesk.work");
  if (!scoped.authorized) return scoped;

  const role = await findQueueMemberRole(queueId, scoped.actorId);
  if (role !== "manager") return { authorized: false, error: FORBIDDEN_QUEUE };
  return scoped;
}

// Resolve a fila pai e autoriza como configuração — pra features que só recebem categoryId.
export async function authorizeCategoryConfigActor(categoryId: string): Promise<AuthorizeActorResult> {
  const queueId = await findQueueIdByCategoryId(categoryId);
  if (!queueId) {
    return { authorized: false, error: { code: "helpdesk.category.not_found", message: "Categoria não encontrada." } };
  }
  return authorizeQueueConfigActor(queueId);
}

// Gate de LEITURA de uma fila (listar categorias, e na Fase 2 ver a fila de chamados):
// helpdesk.manage / helpdesk.read veem qualquer fila; helpdesk.work só as filas em que é membro
// (qualquer papel).
export async function authorizeQueueViewActor(queueId: string): Promise<AuthorizeActorResult> {
  const broad = await authorizeActor(["helpdesk.manage", "helpdesk.read"]);
  if (broad.authorized) return broad;

  const scoped = await authorizeActor("helpdesk.work");
  if (!scoped.authorized) return scoped;

  const role = await findQueueMemberRole(queueId, scoped.actorId);
  if (role === null) return { authorized: false, error: FORBIDDEN_QUEUE };
  return scoped;
}

export type VisibleQueues =
  | { scope: "all" }
  | { scope: "scoped"; queueIds: string[] }
  | { scope: "none" };

// Recorte de listagem no admin: helpdesk.manage / helpdesk.read → todas; helpdesk.work → só as
// filas em que a pessoa é membro (qualquer papel); nenhuma → none (o handler devolve 403).
export async function resolveVisibleQueues(): Promise<VisibleQueues> {
  const broad = await authorizeActor(["helpdesk.manage", "helpdesk.read"]);
  if (broad.authorized) return { scope: "all" };

  const scoped = await authorizeActor("helpdesk.work");
  if (!scoped.authorized) return { scope: "none" };

  return { scope: "scoped", queueIds: await findQueueIdsForUser(scoped.actorId) };
}

// ── Fase 2 — autorização por chamado (§3.2) ────────────────────────────────────────────────────

const TICKET_NOT_FOUND = {
  code: "helpdesk.ticket.not_found",
  message: "Chamado não encontrado.",
} as const;

export type TicketWorkActorResolution =
  | { authorized: false; error: { code: string; message: string } }
  | {
      authorized: true;
      actorId: string;
      ticket: TicketAuthzInfo;
      capabilities: TicketActorCapabilities;
    };

// Gate de AÇÃO num chamado (change-status, assign, comentar como equipe, anexar como equipe):
// helpdesk.manage passa pra qualquer fila; senão exige helpdesk.work E uma linha em queue_members
// da fila do chamado (qualquer papel). Devolve também as capabilities usadas pelas guardas de
// ticket-state.ts (só o assignee/gestor resolve; só helpdesk.manage fecha).
export async function resolveTicketWorkActor(ticketId: string): Promise<TicketWorkActorResolution> {
  const ticket = await findTicketAuthzInfo(ticketId);
  if (!ticket) return { authorized: false, error: TICKET_NOT_FOUND };

  const manage = await authorizeActor("helpdesk.manage");
  let actorId: string;
  let hasManagePermission: boolean;
  if (manage.authorized) {
    actorId = manage.actorId;
    hasManagePermission = true;
  } else {
    const work = await authorizeActor("helpdesk.work");
    if (!work.authorized) {
      return { authorized: false, error: work.error };
    }
    actorId = work.actorId;
    hasManagePermission = false;
  }

  const role = await findQueueMemberRole(ticket.queueId, actorId);
  if (!hasManagePermission && role === null) {
    return { authorized: false, error: FORBIDDEN_QUEUE };
  }

  return {
    authorized: true,
    actorId,
    ticket,
    capabilities: {
      hasManagePermission,
      isQueueManager: role === "manager",
      isQueueMember: role !== null,
      isAssignee: ticket.assigneeUserId !== null && ticket.assigneeUserId === actorId,
    },
  };
}

export type TicketViewActorResolution =
  | { authorized: false; error: { code: string; message: string } }
  | { authorized: true; actorId: string; ticket: TicketAuthzInfo; canSeeInternal: boolean };

// Gate de LEITURA de um chamado pela equipe/liderança (get-ticket, list-tickets): helpdesk.manage
// / helpdesk.read veem qualquer chamado e as notas internal; helpdesk.work só os chamados das
// filas em que é membro. O solicitante lendo o PRÓPRIO chamado NÃO passa por aqui — é tratado no
// handler pelo actorId da sessão (self-service, §3.1).
export async function resolveTicketViewActor(ticketId: string): Promise<TicketViewActorResolution> {
  const ticket = await findTicketAuthzInfo(ticketId);
  if (!ticket) return { authorized: false, error: TICKET_NOT_FOUND };

  const broad = await authorizeActor(["helpdesk.manage", "helpdesk.read"]);
  if (broad.authorized) {
    return { authorized: true, actorId: broad.actorId, ticket, canSeeInternal: true };
  }

  const scoped = await authorizeActor("helpdesk.work");
  if (!scoped.authorized) return { authorized: false, error: scoped.error };

  const role = await findQueueMemberRole(ticket.queueId, scoped.actorId);
  if (role === null) return { authorized: false, error: FORBIDDEN_QUEUE };
  return { authorized: true, actorId: scoped.actorId, ticket, canSeeInternal: true };
}

export { findQueueById, findQueueIdByCategoryId, findQueueIdsForUser, findQueueMemberRole, roleSatisfies } from "./store";
export { findTicketAuthzInfo } from "./store";
export type { TicketAuthzInfo } from "./store";
