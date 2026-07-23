import type { UserRbacContext, RoleRef } from "../../../contracts/types";
import type { UserRoleRow } from "./store";

export function toUserRbacContext(userId: string, rows: UserRoleRow[]): UserRbacContext {
  const rolesById = new Map<string, RoleRef>();
  const permissions = new Set<string>();

  for (const row of rows) {
    rolesById.set(row.roleId, {
      id: row.roleId,
      key: row.roleKey,
      name: row.roleName,
      isSystem: row.roleIsSystem,
    });

    if (row.permissionKey) {
      permissions.add(row.permissionKey);
    }
  }

  const roles = [...rolesById.values()];

  return {
    userId,
    roles,
    permissions: [...permissions],
    isSuperadmin: roles.some((role) => role.key === "superadmin"),
  };
}
