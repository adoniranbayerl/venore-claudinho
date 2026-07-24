import type { OperationResult } from "@/shared/types";
import type { LessonRecord } from "../../../contracts/types";

export type GetLessonQuery = { id: string };
export type GetLessonResult = OperationResult<LessonRecord | null>;
