import type { OperationResult } from "@/shared/types";
import type { LessonSectionRecord } from "../../../../contracts/types";

export type CreateLessonSectionCommand = {
  lessonId: string;
  title: string;
  cmsEntryId?: string;
  videoUrl?: string;
  actorId: string;
};
export type CreateLessonSectionInput = Omit<CreateLessonSectionCommand, "actorId">;
export type CreateLessonSectionResult = OperationResult<LessonSectionRecord>;
