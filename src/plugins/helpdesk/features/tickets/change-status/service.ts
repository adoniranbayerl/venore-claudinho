import { beginOperation, endOperation } from "@/observability";
import { checkStatusTransition, timestampsForTransition, type TicketActorCapabilities } from "../../../shared/ticket-state";
import { notify, type NotificationAudience } from "../../../shared/notify";
import { applyStatusChange } from "./store";
import type { ChangeStatusCommand, ChangeStatusResult } from "./types";
import type { HelpdeskNotificationKind, TicketStatus } from "../../../contracts/types";

// De/para → (que notificação, pra quem). Cobre a reabertura (resolved/closed → in_progress) sem
// uma feature reopen-ticket própria (essa entra na Fase 7) — §2.3 pede `reopened` pro técnico e a
// fila. `null` = a transição não gera notificação (ex: open → in_progress trivial).
function notificationForTransition(
  from: TicketStatus,
  to: TicketStatus,
): { kind: HelpdeskNotificationKind; text: string; audiences: NotificationAudience[] } | null {
  if (to === "waiting") {
    return { kind: "needs_info", text: "aguardando sua resposta", audiences: ["requester"] };
  }
  if (to === "resolved") {
    return { kind: "resolved", text: "chamado resolvido", audiences: ["requester"] };
  }
  if (to === "in_progress" && (from === "resolved" || from === "closed")) {
    return { kind: "reopened", text: "chamado reaberto", audiences: ["assignee", "queue"] };
  }
  if (to === "closed") {
    return { kind: "status_changed", text: "chamado fechado", audiences: ["requester"] };
  }
  if (to === "cancelled") {
    return { kind: "status_changed", text: "chamado cancelado", audiences: ["requester"] };
  }
  return null;
}

// O handler já resolveu o chamado e as capabilities (resolveTicketWorkActor). Aqui aplica as
// guardas de ticket-state.ts (só assignee/gestor resolve; só helpdesk.manage fecha) e grava.
export async function changeStatus(
  command: ChangeStatusCommand,
  context: { currentStatus: TicketStatus; capabilities: TicketActorCapabilities },
): Promise<ChangeStatusResult> {
  const check = checkStatusTransition(context.currentStatus, command.to, context.capabilities);
  if (!check.ok) {
    return { success: false, error: { code: check.code, message: check.message } };
  }

  const stamps = timestampsForTransition(command.to, new Date());

  const handle = beginOperation({
    useCase: "helpdesk.change-status",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const ticket = await applyStatusChange({
    ticketId: command.ticketId,
    from: context.currentStatus,
    to: command.to,
    note: command.note?.trim() || null,
    actorId: command.actorId,
    resolvedAt: stamps.resolvedAt,
    closedAt: stamps.closedAt,
  });

  const notification = notificationForTransition(context.currentStatus, command.to);
  if (notification) {
    await notify({
      ticketId: command.ticketId,
      queueId: ticket.queueId,
      kind: notification.kind,
      text: notification.text,
      actorUserId: command.actorId,
      audiences: notification.audiences,
    });
  }

  endOperation(handle, { success: true });
  return { success: true, data: ticket };
}
