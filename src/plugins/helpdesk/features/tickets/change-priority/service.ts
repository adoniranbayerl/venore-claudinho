import { beginOperation, endOperation } from "@/observability";
import { TICKET_PRIORITIES } from "../../../contracts/types";
import { notifySlaAtRiskForTicket } from "../../../shared/notify";
import { slaDueAt as computeSlaDueAt } from "../../../shared/sla";
import { resolveResolutionMinutes } from "../../../shared/sla-policy-store";
import { applyPriorityChange } from "./store";
import type { ChangePriorityCommand, ChangePriorityResult } from "./types";
import type { TicketPriority } from "../../../contracts/types";

// O handler já resolveu o chamado (resolveTicketWorkActor) e passa a fila + a prioridade corrente.
// Recalcula `sla_due_at = now + resolution_minutes` da política vigente da fila para a NOVA
// prioridade (§2.4). Se o recálculo já nasce em risco (ex.: subiu para `urgent` num chamado
// antigo), dispara `sla_at_risk` para a fila na hora.
export async function changePriority(
  command: ChangePriorityCommand,
  context: { queueId: string; currentPriority: TicketPriority },
): Promise<ChangePriorityResult> {
  if (!(TICKET_PRIORITIES as readonly string[]).includes(command.to)) {
    return { success: false, error: { code: "helpdesk.change-priority.invalid_priority", message: "Prioridade inválida." } };
  }
  if (command.to === context.currentPriority) {
    return { success: false, error: { code: "helpdesk.change-priority.noop", message: "O chamado já está nessa prioridade." } };
  }

  const resolutionMinutes = await resolveResolutionMinutes(context.queueId, command.to);
  const slaDueAt = computeSlaDueAt(new Date(), resolutionMinutes);

  const handle = beginOperation({
    useCase: "helpdesk.change-priority",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const ticket = await applyPriorityChange({
    ticketId: command.ticketId,
    from: context.currentPriority,
    to: command.to,
    slaDueAt,
    actorId: command.actorId,
  });

  await notifySlaAtRiskForTicket({
    id: ticket.id,
    queueId: ticket.queueId,
    slaDueAt: ticket.slaDueAt,
    resolvedAt: ticket.resolvedAt,
    createdAt: ticket.createdAt,
  });

  endOperation(handle, { success: true });
  return { success: true, data: ticket };
}
