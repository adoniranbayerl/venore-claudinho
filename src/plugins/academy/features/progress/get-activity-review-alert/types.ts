import type { OperationResult } from "@/shared/types";

export type ActivityReviewAlert = { count: number; href: string; label: string };
export type GetActivityReviewAlertInput = { actorId: string; isTeacher: boolean };
export type GetActivityReviewAlertResult = OperationResult<ActivityReviewAlert | null>;
