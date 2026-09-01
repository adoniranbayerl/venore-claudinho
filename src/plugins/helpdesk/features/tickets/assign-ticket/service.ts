import { beginOperation, endOperation } from "@/observability";
import { notify } from "../../../shared/notify";
import { applyAssignment, isQueueMember } from "./store";
import type { AssignTicketCommand, AssignTicketResult } from "./types";

// O handler já resolveu o chamado (resolveTicketWorkActor) e passa a fila + o assignee atual.
export async function assignTicket(
  command: AssignTicketCommand,
  context: { queueId: string; currentAssigneeUserId: string | null },
): Promise<AssignTicketResult> {
  const nextAssignee = command.assigneeUserId?.trim() || null;

  if (nextAssignee === context.currentAssigneeUserId) {
    return { success: false, error: { code: "helpdesk.assign-ticket.noop", message: "O chamado já está atribuído a essa pessoa." } };
  }

  if (nextAssignee !== null && !(await isQueueMember(context.queueId, nextAssignee))) {
    return {
      success: false,
      error: {
        code: "helpdesk.assign-ticket.not_a_member",
        message: "O responsável precisa fazer parte da equipe dessa fila.",
      },
    };
  }

  const handle = beginOperation({
    useCase: "helpdesk.assign-ticket",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const ticket = await applyAssignment({
    ticketId: command.ticketId,
    from: context.currentAssigneeUserId,
    to: nextAssignee,
    actorId: command.actorId,
  });

  // §2.3 — o técnico recém-atribuído recebe `assigned_to_you`. Desatribuir (nextAssignee === null)
  // não notifica ninguém.
  if (nextAssignee !== null) {
    await notify({
      ticketId: command.ticketId,
      queueId: context.queueId,
      kind: "assigned_to_you",
      text: "atribuído a você",
      actorUserId: command.actorId,
      audiences: ["assignee"],
      assigneeUserIdOverride: nextAssignee,
    });
  }

  endOperation(handle, { success: true });
  return { success: true, data: ticket };
}
