import { findAllRolesWithPermissions } from "./store";
import type { ListRolesResult } from "./types";

export async function listRoles(): Promise<ListRolesResult> {
  const rows = await findAllRolesWithPermissions();

  return {
    success: true,
    data: rows.map((role) => ({
      id: role.id,
      key: role.key,
      name: role.name,
      isSystem: role.isSystem,
      permissionKeys: role.permissionKeys,
    })),
  };
}
