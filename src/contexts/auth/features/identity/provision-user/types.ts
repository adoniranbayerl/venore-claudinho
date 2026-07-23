import type { OperationResult } from "@/shared/types";

export type ProvisionUserCommand = {
  id: string;
  email: string | null;
  name: string | null;
};

export type ProvisionUserResult = OperationResult<void>;
