import type { OperationResult } from "@/shared/types";
import type { LessonSectionRecord } from "../../../../contracts/types";

export type ListLessonSectionsByLessonQuery = { lessonId: string };
export type ListLessonSectionsByLessonResult = OperationResult<LessonSectionRecord[]>;
