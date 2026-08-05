import type { OperationResult } from "@/shared/types";

export type DeleteLessonMaterialCommand = { id: string; actorId: string };
export type DeleteLessonMaterialInput = Omit<DeleteLessonMaterialCommand, "actorId">;
export type DeleteLessonMaterialResult = OperationResult<{ id: string }>;
