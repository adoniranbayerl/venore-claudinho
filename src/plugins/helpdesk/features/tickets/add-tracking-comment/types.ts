import type { OperationResult } from "@/shared/types";

export type AddTrackingCommentInput = {
  trackingToken: string;
  body: string;
};

export type AddTrackingCommentResult = OperationResult<{ statusChangedTo: string | null }>;
