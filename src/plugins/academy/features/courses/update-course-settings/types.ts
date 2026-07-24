import type { OperationResult } from "@/shared/types";
import type { CourseRecord } from "../../../contracts/types";

export type UpdateCourseSettingsCommand = {
  id: string;
  selfEnrollmentEnabled: boolean;
  publiclyListed: boolean;
  actorId: string;
};
export type UpdateCourseSettingsInput = Omit<UpdateCourseSettingsCommand, "actorId">;
export type UpdateCourseSettingsResult = OperationResult<CourseRecord>;
