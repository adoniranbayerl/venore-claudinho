import type { OperationResult } from "@/shared/types";
import type { CourseRecord } from "../../../contracts/types";

export type PublishCourseCommand = { id: string; actorId: string };
export type PublishCourseInput = Omit<PublishCourseCommand, "actorId">;
export type PublishCourseResult = OperationResult<CourseRecord>;
