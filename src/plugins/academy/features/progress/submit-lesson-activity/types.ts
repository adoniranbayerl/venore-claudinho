import type { OperationResult } from "@/shared/types";
import type { LessonActivitySubmissionRecord } from "../../../contracts/types";

export type SubmitLessonActivityCommand = {
  activityId: string;
  contentText?: string;
  mediaId?: string;
  actorId: string;
};
export type SubmitLessonActivityInput = Omit<SubmitLessonActivityCommand, "actorId">;
export type SubmitLessonActivityResult = OperationResult<LessonActivitySubmissionRecord>;
