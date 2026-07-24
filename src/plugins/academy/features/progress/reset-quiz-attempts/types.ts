import type { OperationResult } from "@/shared/types";

export type ResetQuizAttemptsCommand = { lessonId: string; studentActorId: string; actorId: string };
export type ResetQuizAttemptsInput = Omit<ResetQuizAttemptsCommand, "actorId">;

export type ResetQuizAttemptsResult = OperationResult<{ invalidatedCount: number }>;
