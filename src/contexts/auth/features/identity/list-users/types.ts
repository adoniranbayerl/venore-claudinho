import type { OperationResult } from "@/shared/types";
import type { UserRegistrationStatus } from "../../../contracts/types";

export type UserRef = {
  id: string;
  name: string | null;
  email: string;
  status: UserRegistrationStatus;
};

export type ListUsersResult = OperationResult<UserRef[]>;
