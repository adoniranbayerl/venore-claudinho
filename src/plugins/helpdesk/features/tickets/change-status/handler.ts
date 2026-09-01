import { TICKET_STATUSES } from "../../../contracts/types";
import { resolveTicketWorkActor } from "../../../shared/scoped-authorization";
import { changeStatus } from "./service";
import type { ChangeStatusInput, ChangeStatusResult } from "./types";

// Mudar o status é ação de equipe (helpdesk.work na fila do chamado, ou helpdesk.manage). As
// guardas finas (só assignee/gestor resolve; só helpdesk.manage fecha/cancela/reabre) ficam em
// ticket-state.ts, aplicadas pelo service com as capabilities resolvidas aqui.
export async function changeStatusHandler(input: ChangeStatusInput): Promise<ChangeStatusResult> {
  if (!input.ticketId || input.ticketId.trim().length === 0) {
    return { success: false, error: { code: "helpdesk.change-status.missing_ticket", message: "Chamado não informado." } };
  }
  if (!TICKET_STATUSES.includes(input.to)) {
    return { success: false, error: { code: "helpdesk.change-status.invalid_status", message: "Status inválido." } };
  }

  const actor = await resolveTicketWorkActor(input.ticketId);
  if (!actor.authorized) {
    return { success: false, error: actor.error };
  }

  return changeStatus(
    { ticketId: input.ticketId, to: input.to, note: input.note ?? null, actorId: actor.actorId },
    { currentStatus: actor.ticket.status, capabilities: actor.capabilities },
  );
}
