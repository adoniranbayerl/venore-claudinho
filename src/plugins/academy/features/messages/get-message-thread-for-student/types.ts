import type { OperationResult } from "@/shared/types";
import type { LessonMessageRecord, LessonMessageThreadRecord } from "../../../contracts/types";

export type GetMessageThreadForStudentInput = { threadId: string };
export type GetMessageThreadForStudentResult = OperationResult<{ thread: LessonMessageThreadRecord; messages: LessonMessageRecord[] }>;
