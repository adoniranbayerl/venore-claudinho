import type { OperationResult } from "@/shared/types";

export type MarkLessonSectionReadCommand = { sectionId: string; actorId: string };
export type MarkLessonSectionReadInput = Omit<MarkLessonSectionReadCommand, "actorId">;
export type MarkLessonSectionReadResult = OperationResult<{ sectionId: string; completed: true }>;
