import type { OperationResult } from "@/shared/types";

export type DeleteProgramCommand = { programId: string; actorId: string };
export type DeleteProgramInput = Omit<DeleteProgramCommand, "actorId">;
export type DeleteProgramResult = OperationResult<{ programId: string }>;
