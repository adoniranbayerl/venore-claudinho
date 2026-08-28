import type { OperationResult } from "@/shared/types";

export type DeleteTvBoardCommand = { boardId: string; actorId: string };
export type DeleteTvBoardInput = Omit<DeleteTvBoardCommand, "actorId">;
export type DeleteTvBoardResult = OperationResult<{ boardId: string }>;
