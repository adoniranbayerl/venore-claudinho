import type { OperationResult } from "@/shared/types";

export type PendingUserRef = {
  id: string;
  email: string | null;
  name: string | null;
  createdAt: Date;
};

export type ListPendingUsersResult = OperationResult<PendingUserRef[]>;
