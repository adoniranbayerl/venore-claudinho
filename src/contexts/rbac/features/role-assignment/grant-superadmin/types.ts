import type { OperationResult } from "@/shared/types";

export type GrantSuperadminInput = {
  userId: string;
};

export type GrantSuperadminResult = OperationResult<void>;
