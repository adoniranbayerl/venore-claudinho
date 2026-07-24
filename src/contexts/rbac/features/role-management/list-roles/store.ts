import { db } from "@/infrastructure/database/client";
import { roles, rolePermissions } from "../../../database/schema";

export async function findAllRolesWithPermissions() {
  const roleRows = await db.select().from(roles);
  const permissionRows = await db.select().from(rolePermissions);

  const permissionsByRole = new Map<string, string[]>();
  for (const row of permissionRows) {
    const list = permissionsByRole.get(row.roleId) ?? [];
    list.push(row.permissionKey);
    permissionsByRole.set(row.roleId, list);
  }

  return roleRows.map((role) => ({
    ...role,
    permissionKeys: permissionsByRole.get(role.id) ?? [],
  }));
}
