import type { OperationResult } from "@/shared/types";
import type { AuthenticatedUser } from "../../../contracts/types";

export type GetCurrentUserResult = OperationResult<AuthenticatedUser | null>;
