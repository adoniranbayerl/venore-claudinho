import type { OperationResult } from "@/shared/types";
import type { DeliverableFormat, LessonActivityRecord } from "../../../contracts/types";

export type UpdateLessonActivityCommand = {
  id: string;
  title?: string;
  instructionsText?: string;
  deliverableFormat?: DeliverableFormat;
  actorId: string;
};
export type UpdateLessonActivityInput = Omit<UpdateLessonActivityCommand, "actorId">;
export type UpdateLessonActivityResult = OperationResult<LessonActivityRecord>;
