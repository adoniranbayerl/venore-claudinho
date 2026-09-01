import { authorizeActor } from "@/contexts/rbac";
import { resolveVisibleQueues } from "../../../shared/scoped-authorization";
import { listTickets } from "./service";
import type { ListTicketsQuery, ListTicketsResult } from "./types";

// helpdesk.manage / helpdesk.read → todos os chamados; helpdesk.work → só os das filas
// atribuídas; nenhuma das três → 403. `assignedToMe` recorta pelo actorId da sessão.
export async function listTicketsHandler(query: ListTicketsQuery = {}): Promise<ListTicketsResult> {
  const visible = await resolveVisibleQueues();
  if (visible.scope === "none") {
    return { success: false, error: { code: "helpdesk.list-tickets.forbidden", message: "Você não tem acesso a Chamados." } };
  }

  let assigneeUserId: string | undefined;
  if (query.assignedToMe) {
    const actor = await authorizeActor(["helpdesk.manage", "helpdesk.work", "helpdesk.read"]);
    if (!actor.authorized) {
      return { success: false, error: actor.error };
    }
    assigneeUserId = actor.actorId;
  }

  return listTickets({
    allowedQueueIds: visible.scope === "scoped" ? visible.queueIds : undefined,
    queueId: query.queueId,
    status: query.status,
    onlyActive: query.onlyActive,
    assigneeUserId,
  });
}
