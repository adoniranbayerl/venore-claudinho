import type { OperationResult } from "@/shared/types";
import type { LessonExampleRecord } from "../../../contracts/types";

export type ListLessonExamplesByLessonQuery = { lessonId: string };
export type ListLessonExamplesByLessonResult = OperationResult<LessonExampleRecord[]>;
