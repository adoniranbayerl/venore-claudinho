import type { OperationResult } from "@/shared/types";

export type AssignRoleToUserInput = {
  userId: string;
  roleId: string;
};

export type AssignRoleToUserCommand = AssignRoleToUserInput & {
  actor: { id: string };
};

export type AssignRoleToUserResult = OperationResult<void>;
