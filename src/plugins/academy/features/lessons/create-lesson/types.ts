import type { OperationResult } from "@/shared/types";
import type { LessonRecord } from "../../../contracts/types";

export type CreateLessonCommand = { courseId: string; cmsEntryId: string; videoUrl?: string; actorId: string };
export type CreateLessonInput = Omit<CreateLessonCommand, "actorId">;
export type CreateLessonResult = OperationResult<LessonRecord>;
