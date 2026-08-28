import type { OperationResult } from "@/shared/types";

export type ListScopesForRoleAssignmentInput = {
  userId: string;
  roleId: string;
};

export type RoleAssignmentScopeRef = {
  scopeType: string;
  resourceId: string;
};

export type ListScopesForRoleAssignmentResult = OperationResult<RoleAssignmentScopeRef[]>;
