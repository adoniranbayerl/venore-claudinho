import type { OperationResult } from "@/shared/types";

export type MarkLessonMaterialReadCommand = { materialId: string; actorId: string };
export type MarkLessonMaterialReadInput = Omit<MarkLessonMaterialReadCommand, "actorId">;
export type MarkLessonMaterialReadResult = OperationResult<{ materialId: string; completed: true }>;
