import { getCurrentUser } from "@/contexts/auth";
import { listMyNotifications } from "./service";
import type { ListMyNotificationsResult } from "./types";

const UNAUTHENTICATED = {
  code: "helpdesk.list-my-notifications.unauthenticated",
  message: "É necessário estar autenticado para ver suas notificações.",
} as const;

// Só exige sessão (§2.3 — entrega ao cliente por polling em GET /api/helpdesk/notifications).
export async function listMyNotificationsHandler(limit?: number): Promise<ListMyNotificationsResult> {
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return { success: false, error: UNAUTHENTICATED };
  }
  return listMyNotifications(currentUser.data.id, limit);
}
