import type { OperationResult } from "@/shared/types";
import type { LessonRecord } from "../../../contracts/types";

export type ReorderLessonsCommand = { courseId: string; lessonIds: string[]; actorId: string };
export type ReorderLessonsInput = Omit<ReorderLessonsCommand, "actorId">;
export type ReorderLessonsResult = OperationResult<LessonRecord[]>;
