import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { rolePermissions, roles, userRoles } from "../../../database/schema";

// Concessão aditiva e idempotente: NUNCA apaga o que o papel já tem (ao contrário de
// replaceRolePermissions em update-role-permissions/store.ts). onConflictDoNothing + returning
// faz `inserted.length` refletir só as linhas de fato novas.
export async function grantPermissionsToRoleByKey(roleKey: string, permissionKeys: string[]) {
  return db.transaction(async (tx) => {
    const [role] = await tx.select({ id: roles.id }).from(roles).where(eq(roles.key, roleKey)).limit(1);
    if (!role) {
      return { roleFound: false as const, grantedCount: 0, affectedUserIds: [] as string[] };
    }

    const inserted =
      permissionKeys.length > 0
        ? await tx
            .insert(rolePermissions)
            .values(permissionKeys.map((permissionKey) => ({ roleId: role.id, permissionKey })))
            .onConflictDoNothing({ target: [rolePermissions.roleId, rolePermissions.permissionKey] })
            .returning({ permissionKey: rolePermissions.permissionKey })
        : [];

    const affected = await tx
      .select({ userId: userRoles.userId })
      .from(userRoles)
      .where(eq(userRoles.roleId, role.id));

    return {
      roleFound: true as const,
      grantedCount: inserted.length,
      affectedUserIds: affected.map((row) => row.userId),
    };
  });
}
