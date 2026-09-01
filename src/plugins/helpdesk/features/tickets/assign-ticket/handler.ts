import { resolveTicketWorkActor } from "../../../shared/scoped-authorization";
import { assignTicket } from "./service";
import type { AssignTicketInput, AssignTicketResult } from "./types";

// Triagem/atribuição na aba Fila do admin — ação de equipe (helpdesk.work na fila, ou
// helpdesk.manage). Também cobre o técnico "assumindo" um chamado (self-assign).
export async function assignTicketHandler(input: AssignTicketInput): Promise<AssignTicketResult> {
  if (!input.ticketId || input.ticketId.trim().length === 0) {
    return { success: false, error: { code: "helpdesk.assign-ticket.missing_ticket", message: "Chamado não informado." } };
  }

  const actor = await resolveTicketWorkActor(input.ticketId);
  if (!actor.authorized) {
    return { success: false, error: actor.error };
  }

  return assignTicket(
    { ticketId: input.ticketId, assigneeUserId: input.assigneeUserId, actorId: actor.actorId },
    { queueId: actor.ticket.queueId, currentAssigneeUserId: actor.ticket.assigneeUserId },
  );
}
