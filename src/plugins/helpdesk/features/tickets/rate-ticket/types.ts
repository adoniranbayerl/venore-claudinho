import type { OperationResult } from "@/shared/types";

export type RateTicketInput = {
  trackingToken: string;
  score: number;
  comment?: string | null;
};

export type RateTicketResult = OperationResult<{ score: number }>;
