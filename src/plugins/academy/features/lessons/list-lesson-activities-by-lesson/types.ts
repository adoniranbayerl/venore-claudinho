import type { OperationResult } from "@/shared/types";
import type { LessonActivityRecord } from "../../../contracts/types";

export type ListLessonActivitiesByLessonQuery = { lessonId: string };
export type ListLessonActivitiesByLessonResult = OperationResult<LessonActivityRecord[]>;
