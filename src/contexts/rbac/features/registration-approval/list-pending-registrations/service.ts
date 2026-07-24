import { listPendingUsers } from "@/contexts/auth";
import { toPendingRegistrationView } from "./view";
import type { ListPendingRegistrationsResult } from "./types";

export async function listPendingRegistrations(): Promise<ListPendingRegistrationsResult> {
  const pendingUsers = await listPendingUsers();
  if (!pendingUsers.success) return pendingUsers;

  return { success: true, data: pendingUsers.data.map(toPendingRegistrationView) };
}
