import type { OperationResult } from "@/shared/types";
import type { CourseRecord } from "../../../contracts/types";

export type GetCourseForStudentQuery = { id: string };
export type GetCourseForStudentResult = OperationResult<CourseRecord | null>;
