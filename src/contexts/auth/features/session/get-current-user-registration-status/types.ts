import type { OperationResult } from "@/shared/types";
import type { UserRegistrationStatus } from "../../../contracts/types";

export type GetCurrentUserRegistrationStatusResult = OperationResult<UserRegistrationStatus | null>;
