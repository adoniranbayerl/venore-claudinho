import type { OperationResult } from "@/shared/types";

export type DeleteMenuCommand = { id: string; actorId: string };
export type DeleteMenuInput = Omit<DeleteMenuCommand, "actorId">;
export type DeleteMenuResult = OperationResult<{ id: string }>;
