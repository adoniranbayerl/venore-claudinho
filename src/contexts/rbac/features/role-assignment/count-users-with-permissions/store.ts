import { eq, inArray } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { rolePermissions, userRoles } from "../../../database/schema";

export async function countDistinctUsersWithPermissions(permissionKeys: string[]): Promise<number> {
  const rows = await db
    .selectDistinct({ userId: userRoles.userId })
    .from(userRoles)
    .innerJoin(rolePermissions, eq(rolePermissions.roleId, userRoles.roleId))
    .where(inArray(rolePermissions.permissionKey, permissionKeys));

  return rows.length;
}
