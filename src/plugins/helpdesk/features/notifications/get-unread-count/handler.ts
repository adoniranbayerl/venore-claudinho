import { getCurrentUser } from "@/contexts/auth";
import { getUnreadCount } from "./service";
import type { GetUnreadCountResult } from "./types";

// Contador leve pro badge do sino — usado pelo polling quando não precisa da lista inteira.
export async function getUnreadCountHandler(): Promise<GetUnreadCountResult> {
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: { code: "helpdesk.get-unread-count.unauthenticated", message: "É necessário estar autenticado." },
    };
  }
  return getUnreadCount(currentUser.data.id);
}
