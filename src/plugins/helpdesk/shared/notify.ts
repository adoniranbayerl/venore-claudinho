import { findTicketAuthzInfo } from "./scoped-authorization/store";
import {
  findQueueMemberUserIds,
  findTicketNotificationBasis,
  insertNotifications,
  ticketIdsWithSlaAtRiskNotification,
} from "./notification-store";
import { needsSlaAtRiskAlert } from "./sla";
import { notificationSummary, resolveNotificationRecipients, type NotificationAudience } from "./notify-recipients";
import type { HelpdeskNotificationKind } from "../contracts/types";

// Helper único de notificação in-app (docs/chamados-plugin.md §2.3). Chamado pelo mesmo service
// que faz a ação (open-ticket, assign-ticket, add-comment, change-status, e a reabertura dentro de
// change-status). Sem e-mail/push no v1 — só grava linha em `helpdesk_notifications`, entregue por
// polling. `findTicketAuthzInfo` vem do store direto (não do barrel scoped-authorization/index,
// que puxa @/contexts/rbac → next-auth) pra manter os services testáveis sem essa cadeia.
//
// A parte pura (resolução de destinatários) mora em ./notify-recipients — reexportada aqui.
export { resolveNotificationRecipients, notificationSummary } from "./notify-recipients";
export type { NotificationAudience } from "./notify-recipients";

export type NotifyInput = {
  ticketId: string;
  // Passe o queueId quando já tiver em mãos (evita uma query); senão é resolvido do chamado.
  queueId?: string;
  kind: HelpdeskNotificationKind;
  // `summary` pronto, OU `text` (o trecho final) — nesse caso notify() monta
  // "{fila} · {número} · {text}" resolvendo fila/número do chamado.
  summary?: string;
  text?: string;
  actorUserId: string | null;
  audiences: readonly NotificationAudience[];
  // Override do assignee — usado por assign-ticket, que quer notificar o assignee RECÉM-definido.
  assigneeUserIdOverride?: string | null;
};

export async function notify(input: NotifyInput): Promise<void> {
  const ticket = await findTicketAuthzInfo(input.ticketId);
  if (!ticket) return;

  const queueId = input.queueId ?? ticket.queueId;
  const needsQueue = input.audiences.includes("queue");
  const queueMemberUserIds = needsQueue ? await findQueueMemberUserIds(queueId) : [];

  const recipients = resolveNotificationRecipients({
    audiences: input.audiences,
    actorUserId: input.actorUserId,
    queueMemberUserIds,
    assigneeUserId:
      input.assigneeUserIdOverride !== undefined ? input.assigneeUserIdOverride : ticket.assigneeUserId,
    requesterUserId: ticket.requesterUserId,
  });
  if (recipients.length === 0) return;

  let summary = input.summary;
  if (!summary) {
    const basis = await findTicketNotificationBasis(input.ticketId);
    summary = basis
      ? notificationSummary({ queueName: basis.queueName, reference: basis.reference, text: input.text ?? "" })
      : (input.text ?? input.kind);
  }

  await insertNotifications(
    recipients.map((recipientUserId) => ({
      recipientUserId,
      ticketId: input.ticketId,
      kind: input.kind,
      summary: summary as string,
    })),
  );
}

// Fase 4 (§2.4) — grava `sla_at_risk` para a fila SE o chamado cruzou 80 % do prazo (ou já
// estourou) sem resolução E a fila ainda não foi avisada. Chamado por change-priority (recálculo
// pode já nascer em risco) e pela varredura de polling (features/sla/sweep-sla-at-risk). Devolve
// true quando gravou. Best-effort: sem prazo, sem risco → não faz nada.
export async function notifySlaAtRiskForTicket(ticket: {
  id: string;
  queueId: string;
  slaDueAt: Date | null;
  resolvedAt: Date | null;
  createdAt: Date;
}): Promise<boolean> {
  if (!needsSlaAtRiskAlert({ slaDueAt: ticket.slaDueAt, resolvedAt: ticket.resolvedAt, createdAt: ticket.createdAt })) {
    return false;
  }
  const alerted = await ticketIdsWithSlaAtRiskNotification([ticket.id]);
  if (alerted.has(ticket.id)) return false;

  await notify({
    ticketId: ticket.id,
    queueId: ticket.queueId,
    kind: "sla_at_risk",
    text: "SLA em risco",
    actorUserId: null,
    audiences: ["queue"],
  });
  return true;
}
