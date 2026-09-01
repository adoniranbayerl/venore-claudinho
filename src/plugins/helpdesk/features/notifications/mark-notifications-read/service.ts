import { beginOperation, endOperation } from "@/observability";
import { countUnreadForUser, markNotificationsReadForUser } from "../../../shared/notification-store";
import type { MarkNotificationsReadResult } from "./types";

export async function markNotificationsRead(
  recipientUserId: string,
  ids: string[],
): Promise<MarkNotificationsReadResult> {
  const handle = beginOperation({
    useCase: "helpdesk.mark-notifications-read",
    actor: { id: recipientUserId, type: "user" },
    kind: "write",
  });

  const markedCount = await markNotificationsReadForUser(recipientUserId, ids);
  const unreadCount = await countUnreadForUser(recipientUserId);

  endOperation(handle, { success: true });
  return { success: true, data: { markedCount, unreadCount } };
}
