import type { OperationResult } from "@/shared/types";

export type ApproveRegistrationInput = {
  userId: string;
  roleId?: string;
};

export type ApproveRegistrationCommand = ApproveRegistrationInput & { actor: { id: string } };

export type ApproveRegistrationResult = OperationResult<void>;
