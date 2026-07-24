import type { OperationResult } from "@/shared/types";
import type { AuthenticatedUser } from "../../../contracts/types";

export type FindUserByEmailQuery = {
  email: string;
};

export type FindUserByEmailResult = OperationResult<AuthenticatedUser>;
