import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { roles, rolePermissions, userRoles } from "../../../database/schema";

export type UserRoleRow = {
  roleId: string;
  roleKey: string;
  roleName: string;
  roleIsSystem: boolean;
  permissionKey: string | null;
};

export async function findUserRoleRows(userId: string): Promise<UserRoleRow[]> {
  const rows = await db
    .select({
      roleId: roles.id,
      roleKey: roles.key,
      roleName: roles.name,
      roleIsSystem: roles.isSystem,
      permissionKey: rolePermissions.permissionKey,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .leftJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
    .where(eq(userRoles.userId, userId));

  return rows;
}
