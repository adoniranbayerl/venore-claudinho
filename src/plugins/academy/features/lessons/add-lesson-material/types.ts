import type { OperationResult } from "@/shared/types";
import type { LessonMaterialRecord } from "../../../contracts/types";

export type AddLessonMaterialCommand = {
  lessonId: string;
  mediaId: string;
  label: string;
  actorId: string;
};
export type AddLessonMaterialInput = Omit<AddLessonMaterialCommand, "actorId">;
export type AddLessonMaterialResult = OperationResult<LessonMaterialRecord>;
