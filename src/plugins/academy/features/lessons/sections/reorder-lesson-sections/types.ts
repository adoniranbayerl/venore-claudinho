import type { OperationResult } from "@/shared/types";
import type { LessonSectionRecord } from "../../../../contracts/types";

export type ReorderLessonSectionsCommand = { lessonId: string; sectionIds: string[]; actorId: string };
export type ReorderLessonSectionsInput = Omit<ReorderLessonSectionsCommand, "actorId">;
export type ReorderLessonSectionsResult = OperationResult<LessonSectionRecord[]>;
