import { and, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { roleAssignmentScopes } from "../../../database/schema";
import type { RoleAssignmentScopeRef } from "./types";

export async function findScopesForRoleAssignment(userId: string, roleId: string): Promise<RoleAssignmentScopeRef[]> {
  const rows = await db
    .select({ scopeType: roleAssignmentScopes.scopeType, resourceId: roleAssignmentScopes.resourceId })
    .from(roleAssignmentScopes)
    .where(and(eq(roleAssignmentScopes.userId, userId), eq(roleAssignmentScopes.roleId, roleId)));

  return rows;
}
