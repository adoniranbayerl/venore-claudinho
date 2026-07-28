import type { OperationResult } from "@/shared/types";

export type DeleteLessonSectionCommand = { id: string; actorId: string };
export type DeleteLessonSectionInput = Omit<DeleteLessonSectionCommand, "actorId">;
export type DeleteLessonSectionResult = OperationResult<{ id: string }>;
