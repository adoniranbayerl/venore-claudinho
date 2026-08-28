import type { OperationResult } from "@/shared/types";

export type AssignScopeToRoleAssignmentInput = {
  userId: string;
  roleId: string;
  scopeType: string;
  resourceId: string;
};

export type AssignScopeToRoleAssignmentCommand = AssignScopeToRoleAssignmentInput & {
  actor: { id: string };
};

export type AssignScopeToRoleAssignmentResult = OperationResult<void>;
