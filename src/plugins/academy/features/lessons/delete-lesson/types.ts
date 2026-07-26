import type { OperationResult } from "@/shared/types";

export type DeleteLessonCommand = { id: string; actorId: string };
export type DeleteLessonInput = Omit<DeleteLessonCommand, "actorId">;
export type DeleteLessonResult = OperationResult<{ id: string }>;
