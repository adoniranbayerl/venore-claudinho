import type { OperationResult } from "@/shared/types";

export type DeleteInstitutionCommand = { institutionId: string; actorId: string };
export type DeleteInstitutionInput = Omit<DeleteInstitutionCommand, "actorId">;
export type DeleteInstitutionResult = OperationResult<{ institutionId: string }>;
