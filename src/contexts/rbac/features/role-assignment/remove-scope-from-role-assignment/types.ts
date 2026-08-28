import type { OperationResult } from "@/shared/types";

export type RemoveScopeFromRoleAssignmentInput = {
  userId: string;
  roleId: string;
  scopeType: string;
  resourceId: string;
};

export type RemoveScopeFromRoleAssignmentCommand = RemoveScopeFromRoleAssignmentInput & {
  actor: { id: string };
};

export type RemoveScopeFromRoleAssignmentResult = OperationResult<void>;
