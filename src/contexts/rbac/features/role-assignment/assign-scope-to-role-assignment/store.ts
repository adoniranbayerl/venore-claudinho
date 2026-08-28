import { and, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { roleAssignmentScopes, userRoles } from "../../../database/schema";

export async function userRoleAssignmentExists(userId: string, roleId: string): Promise<boolean> {
  const [row] = await db
    .select({ userId: userRoles.userId })
    .from(userRoles)
    .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)))
    .limit(1);
  return row !== undefined;
}

export async function insertRoleAssignmentScope(
  userId: string,
  roleId: string,
  scopeType: string,
  resourceId: string,
): Promise<void> {
  await db
    .insert(roleAssignmentScopes)
    .values({ userId, roleId, scopeType, resourceId })
    .onConflictDoNothing({
      target: [
        roleAssignmentScopes.userId,
        roleAssignmentScopes.roleId,
        roleAssignmentScopes.scopeType,
        roleAssignmentScopes.resourceId,
      ],
    });
}
