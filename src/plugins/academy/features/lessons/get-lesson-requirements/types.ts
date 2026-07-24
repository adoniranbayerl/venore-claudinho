import type { OperationResult } from "@/shared/types";
import type { LessonRequirementsRecord } from "../../../contracts/types";

export type GetLessonRequirementsQuery = { lessonId: string };
export type GetLessonRequirementsResult = OperationResult<LessonRequirementsRecord | null>;
