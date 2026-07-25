import type { OperationResult } from "@/shared/types";

export type ListLogEntriesQuery = {
  success?: boolean;
  useCase?: string;
  limit?: number;
  cursor?: string;
};

export type LogEntrySummary = {
  id: string;
  useCase: string;
  actorId: string;
  actorType: string;
  kind: string;
  success: boolean;
  errorCode: string | null;
  errorMessage: string | null;
  durationMs: number;
  startedAt: Date;
};

export type ListLogEntriesResult = OperationResult<{ entries: LogEntrySummary[]; hasMore: boolean }>;
