import type { OperationResult } from "@/shared/types";
import type { LessonMessageThreadWithContext } from "../../../shared/lesson-messages-store";

export type ListAllMessageThreadsResult = OperationResult<LessonMessageThreadWithContext[]>;
