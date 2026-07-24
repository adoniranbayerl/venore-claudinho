import type { OperationResult } from "@/shared/types";
import type { CourseRecord } from "../../../contracts/types";

export type CreateCourseCommand = { title: string; description?: string; actorId: string };
export type CreateCourseInput = Omit<CreateCourseCommand, "actorId">;
export type CreateCourseResult = OperationResult<CourseRecord>;
