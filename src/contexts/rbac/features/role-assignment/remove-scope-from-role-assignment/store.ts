import { and, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { roleAssignmentScopes } from "../../../database/schema";

export async function deleteRoleAssignmentScope(
  userId: string,
  roleId: string,
  scopeType: string,
  resourceId: string,
): Promise<void> {
  await db
    .delete(roleAssignmentScopes)
    .where(
      and(
        eq(roleAssignmentScopes.userId, userId),
        eq(roleAssignmentScopes.roleId, roleId),
        eq(roleAssignmentScopes.scopeType, scopeType),
        eq(roleAssignmentScopes.resourceId, resourceId),
      ),
    );
}
