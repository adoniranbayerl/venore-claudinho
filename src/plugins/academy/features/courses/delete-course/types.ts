import type { OperationResult } from "@/shared/types";

export type DeleteCourseCommand = { id: string; actorId: string };
export type DeleteCourseInput = Omit<DeleteCourseCommand, "actorId">;
export type DeleteCourseResult = OperationResult<{ id: string }>;
