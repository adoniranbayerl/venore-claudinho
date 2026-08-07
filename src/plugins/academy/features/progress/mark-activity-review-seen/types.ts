import type { OperationResult } from "@/shared/types";

export type MarkActivityReviewSeenCommand = { activityId: string; actorId: string };
export type MarkActivityReviewSeenInput = Omit<MarkActivityReviewSeenCommand, "actorId">;
export type MarkActivityReviewSeenResult = OperationResult<{ activityId: string }>;
