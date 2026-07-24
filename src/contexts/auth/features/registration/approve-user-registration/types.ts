import type { OperationResult } from "@/shared/types";

export type ApproveUserRegistrationInput = {
  userId: string;
};

export type ApproveUserRegistrationResult = OperationResult<void>;
