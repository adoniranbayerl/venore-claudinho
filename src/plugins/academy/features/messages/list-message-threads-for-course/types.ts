import type { OperationResult } from "@/shared/types";
import type { LessonMessageThreadWithContext } from "../../../shared/lesson-messages-store";

export type ListMessageThreadsForCourseQuery = { courseId: string; studentActorId: string };
export type ListMessageThreadsForCourseResult = OperationResult<LessonMessageThreadWithContext[]>;
