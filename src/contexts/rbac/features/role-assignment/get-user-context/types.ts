import type { OperationResult } from "@/shared/types";
import type { UserRbacContext } from "../../../contracts/types";

export type GetUserContextQuery = {
  userId: string;
};

export type GetUserContextResult = OperationResult<UserRbacContext>;
