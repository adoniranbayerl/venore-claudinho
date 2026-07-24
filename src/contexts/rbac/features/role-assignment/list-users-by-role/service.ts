import { listUsers } from "@/contexts/auth";
import { findUserIdsWithRole } from "./store";
import type { ListUsersByRoleInput, ListUsersByRoleResult } from "./types";

export async function listUsersByRole(command: ListUsersByRoleInput): Promise<ListUsersByRoleResult> {
  const userIds = await findUserIdsWithRole(command.roleId);
  if (userIds.length === 0) {
    return { success: true, data: [] };
  }

  const allUsers = await listUsers();
  if (!allUsers.success) {
    return allUsers;
  }

  const userIdSet = new Set(userIds);
  const matched = allUsers.data
    .filter((user) => userIdSet.has(user.id))
    .map((user) => ({ id: user.id, name: user.name, email: user.email }));

  return { success: true, data: matched };
}
