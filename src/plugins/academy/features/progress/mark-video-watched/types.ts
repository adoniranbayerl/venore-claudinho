import type { OperationResult } from "@/shared/types";

export type MarkVideoWatchedCommand = { lessonId: string; actorId: string };
export type MarkVideoWatchedInput = Omit<MarkVideoWatchedCommand, "actorId">;
export type MarkVideoWatchedResult = OperationResult<{ lessonId: string; completed: true }>;
