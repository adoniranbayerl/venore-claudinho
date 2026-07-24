import type { OperationResult } from "@/shared/types";
import type { CourseRecord } from "../../../contracts/types";

export type ListCoursesResult = OperationResult<CourseRecord[]>;
