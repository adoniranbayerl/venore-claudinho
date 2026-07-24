import { findPendingUsers } from "./store";
import type { ListPendingUsersResult } from "./types";

export async function listPendingUsers(): Promise<ListPendingUsersResult> {
  const pendingUsers = await findPendingUsers();
  return { success: true, data: pendingUsers };
}
