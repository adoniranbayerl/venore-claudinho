import type { OperationResult } from "@/shared/types";
import type { LessonMaterialRecord } from "../../../contracts/types";

export type ListLessonMaterialsByLessonQuery = { lessonId: string };
export type ListLessonMaterialsByLessonResult = OperationResult<LessonMaterialRecord[]>;
