import type { OperationResult } from "@/shared/types";
import type { LessonSectionRecord } from "../../../../contracts/types";

export type GetLessonSectionQuery = { id: string };
export type GetLessonSectionResult = OperationResult<LessonSectionRecord | null>;
