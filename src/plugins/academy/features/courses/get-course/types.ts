import type { OperationResult } from "@/shared/types";
import type { CourseRecord } from "../../../contracts/types";

export type GetCourseQuery = { id: string };
export type GetCourseResult = OperationResult<CourseRecord | null>;
