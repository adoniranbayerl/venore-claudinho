import type { OperationResult } from "@/shared/types";
import type { LessonRecord } from "../../../contracts/types";

export type UpdateLessonCommand = {
  id: string;
  cmsEntryId?: string;
  videoUrl?: string;
  actorId: string;
};
export type UpdateLessonInput = Omit<UpdateLessonCommand, "actorId">;
export type UpdateLessonResult = OperationResult<LessonRecord>;
