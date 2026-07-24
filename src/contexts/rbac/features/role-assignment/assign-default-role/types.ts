import type { OperationResult } from "@/shared/types";

export type GrantDefaultRoleInput = {
  userId: string;
};

export type GrantDefaultRoleResult = OperationResult<void>;
