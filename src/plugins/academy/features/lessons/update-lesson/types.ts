import type { OperationResult } from "@/shared/types";
import type { LessonRecord } from "../../../contracts/types";

export type UpdateLessonCommand = {
  id: string;
  cmsEntryId?: string;
  videoUrl?: string;
  // null limpa a capa; undefined não toca no campo.
  coverMediaId?: string | null;
  actorId: string;
};
export type UpdateLessonInput = Omit<UpdateLessonCommand, "actorId">;
export type UpdateLessonResult = OperationResult<LessonRecord>;
