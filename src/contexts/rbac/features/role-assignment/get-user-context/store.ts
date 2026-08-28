import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { roleAssignmentScopes, roles, rolePermissions, userRoles } from "../../../database/schema";

export type UserRoleRow = {
  roleId: string;
  roleKey: string;
  roleName: string;
  roleIsSystem: boolean;
  permissionKey: string | null;
};

export type UserScopeRow = {
  roleId: string;
  scopeType: string;
  resourceId: string;
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

// Query SEPARADA de propósito (não um LEFT JOIN na de cima): juntar escopo × permission na mesma
// query multiplicaria as linhas (papel × permission × escopo). Aqui as linhas de escopo vêm
// agrupáveis por roleId e o view.ts cruza com as permissions em memória (fan-out controlado).
export async function findUserScopeRows(userId: string): Promise<UserScopeRow[]> {
  const rows = await db
    .select({
      roleId: roleAssignmentScopes.roleId,
      scopeType: roleAssignmentScopes.scopeType,
      resourceId: roleAssignmentScopes.resourceId,
    })
    .from(roleAssignmentScopes)
    .where(eq(roleAssignmentScopes.userId, userId));

  return rows;
}
