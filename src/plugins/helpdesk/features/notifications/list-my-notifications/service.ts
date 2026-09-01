import { countUnreadForUser, listNotificationsForUser } from "../../../shared/notification-store";
import type { ListMyNotificationsResult } from "./types";

// Últimas N notificações do ator + contador de não lidas (§2.3) — self-service, sem permission:
// cada pessoa só vê as próprias linhas (filtro por recipientUserId no store). Sem store.ts próprio
// de propósito, mesmo padrão de list-my-tickets: a tabela é compartilhada (shared/notification-
// store.ts) e nenhuma das três features notifications/* é dona natural dela.
export async function listMyNotifications(recipientUserId: string, limit?: number): Promise<ListMyNotificationsResult> {
  const [notifications, unreadCount] = await Promise.all([
    listNotificationsForUser(recipientUserId, limit),
    countUnreadForUser(recipientUserId),
  ]);
  return { success: true, data: { notifications, unreadCount } };
}
