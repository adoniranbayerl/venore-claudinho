import type { OperationResult } from "@/shared/types";

export type PendingRegistrationView = {
  userId: string;
  email: string | null;
  name: string | null;
  pendingSince: Date;
};

export type ListPendingRegistrationsResult = OperationResult<PendingRegistrationView[]>;
