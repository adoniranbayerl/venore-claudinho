import type { OperationResult } from "@/shared/types";

export type DeleteBoardCommand = { boardId: string; actorId: string };
export type DeleteBoardInput = Omit<DeleteBoardCommand, "actorId">;
export type DeleteBoardResult = OperationResult<{ id: string }>;
