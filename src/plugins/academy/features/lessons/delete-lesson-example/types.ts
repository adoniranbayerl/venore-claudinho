import type { OperationResult } from "@/shared/types";

export type DeleteLessonExampleCommand = { id: string; actorId: string };
export type DeleteLessonExampleInput = Omit<DeleteLessonExampleCommand, "actorId">;
export type DeleteLessonExampleResult = OperationResult<{ id: string }>;
