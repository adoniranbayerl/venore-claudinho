import { countUnreadForUser } from "../../../shared/notification-store";
import type { GetUnreadCountResult } from "./types";

export async function getUnreadCount(recipientUserId: string): Promise<GetUnreadCountResult> {
  return { success: true, data: { count: await countUnreadForUser(recipientUserId) } };
}
