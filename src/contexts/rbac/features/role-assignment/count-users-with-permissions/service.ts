import { countDistinctUsersWithPermissions } from "./store";
import type { CountUsersWithPermissionsQuery, CountUsersWithPermissionsResult } from "./types";

export async function countUsersWithPermissions(query: CountUsersWithPermissionsQuery): Promise<CountUsersWithPermissionsResult> {
  if (query.permissionKeys.length === 0) {
    return { success: true, data: 0 };
  }

  const count = await countDistinctUsersWithPermissions(query.permissionKeys);
  return { success: true, data: count };
}
