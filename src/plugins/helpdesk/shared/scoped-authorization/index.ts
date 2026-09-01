import { authorizeActor, type AuthorizeActorResult } from "@/contexts/rbac";
import { findQueueIdByCategoryId, findQueueIdsForUser, findQueueMemberRole } from "./store";

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

export { findQueueById, findQueueIdByCategoryId, findQueueIdsForUser, findQueueMemberRole, roleSatisfies } from "./store";
