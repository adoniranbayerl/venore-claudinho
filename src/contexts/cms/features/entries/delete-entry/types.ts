import type { OperationResult } from "@/shared/types";

export type DeleteEntryCommand = { id: string; actorId: string };
export type DeleteEntryInput = Omit<DeleteEntryCommand, "actorId">;
export type DeleteEntryResult = OperationResult<void>;
