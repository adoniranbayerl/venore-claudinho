import type { OperationResult } from "@/shared/types";
import type { LessonRecord } from "../../../contracts/types";

export type ListLessonsByCourseQuery = { courseId: string };
export type ListLessonsByCourseResult = OperationResult<LessonRecord[]>;
