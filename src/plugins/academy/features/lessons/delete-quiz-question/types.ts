import type { OperationResult } from "@/shared/types";

export type DeleteQuizQuestionCommand = { id: string; actorId: string };
export type DeleteQuizQuestionInput = Omit<DeleteQuizQuestionCommand, "actorId">;
export type DeleteQuizQuestionResult = OperationResult<{ id: string }>;
