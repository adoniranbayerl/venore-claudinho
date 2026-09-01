import { TICKET_PRIORITIES } from "../../../contracts/types";
import { resolveTicketWorkActor } from "../../../shared/scoped-authorization";
import { changePriority } from "./service";
import type { ChangePriorityInput, ChangePriorityResult } from "./types";

// Mudar a prioridade é ação de equipe (§3.1 — "assumir, comentar, anexar, mudar
// status/prioridade/categoria, transferir"): helpdesk.work na fila do chamado, ou helpdesk.manage.
export async function changePriorityHandler(input: ChangePriorityInput): Promise<ChangePriorityResult> {
  if (!input.ticketId || input.ticketId.trim().length === 0) {
    return { success: false, error: { code: "helpdesk.change-priority.missing_ticket", message: "Chamado não informado." } };
  }
  if (!(TICKET_PRIORITIES as readonly string[]).includes(input.priority)) {
    return { success: false, error: { code: "helpdesk.change-priority.invalid_priority", message: "Prioridade inválida." } };
  }

  const actor = await resolveTicketWorkActor(input.ticketId);
  if (!actor.authorized) {
    return { success: false, error: actor.error };
  }

  return changePriority(
    { ticketId: input.ticketId, to: input.priority, actorId: actor.actorId },
    { queueId: actor.ticket.queueId, currentPriority: actor.ticket.priority },
  );
}
