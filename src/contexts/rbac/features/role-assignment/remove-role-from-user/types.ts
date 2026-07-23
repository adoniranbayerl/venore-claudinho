import type { OperationResult } from "@/shared/types";

export type RemoveRoleFromUserInput = {
  userId: string;
  roleId: string;
};

export type RemoveRoleFromUserCommand = RemoveRoleFromUserInput & {
  actor: { id: string };
};

export type RemoveRoleFromUserResult = OperationResult<void>;
