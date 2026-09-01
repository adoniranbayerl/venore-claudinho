// Parte pura e testável de shared/notify.ts (§2.3) — sem I/O, sem import de db/rbac, pra o teste
// unitário rodar sem tocar em banco nem na cadeia do next-auth.

// De quem é a notificação. `queue` = todos os membros da fila (manager + agent); `assignee` = o
// técnico responsável atual; `requester` = o solicitante logado. A resolução final é a UNIÃO das
// audiências pedidas, deduplicada, menos o autor da ação.
export type NotificationAudience = "queue" | "assignee" | "requester";

// Dada a lista de membros da fila + o assignee + o requester + o autor, devolve os destinatários
// finais de um conjunto de audiências.
export function resolveNotificationRecipients(input: {
  audiences: readonly NotificationAudience[];
  actorUserId: string | null;
  queueMemberUserIds: readonly string[];
  assigneeUserId: string | null;
  requesterUserId: string | null;
}): string[] {
  const wanted = new Set(input.audiences);
  const pool: string[] = [];

  if (wanted.has("queue")) pool.push(...input.queueMemberUserIds);
  if (wanted.has("assignee") && input.assigneeUserId) pool.push(input.assigneeUserId);
  if (wanted.has("requester") && input.requesterUserId) pool.push(input.requesterUserId);

  const seen = new Set<string>();
  const recipients: string[] = [];
  for (const userId of pool) {
    if (!userId) continue;
    if (userId === input.actorUserId) continue; // nunca notifica quem fez a ação
    if (seen.has(userId)) continue;
    seen.add(userId);
    recipients.push(userId);
  }
  return recipients;
}

// Monta o `summary` pronto pra lista: "Manutenção · manutencao-87 · novo chamado".
export function notificationSummary(parts: { queueName: string; reference: string; text: string }): string {
  return `${parts.queueName} · ${parts.reference} · ${parts.text}`;
}
