import type { OperationResult } from "@/shared/types";
import type { EventLevel, EventOutcome } from "../../contracts/types";

export type ListEventsQuery = {
  level?: EventLevel;
  origin?: string;
  actorId?: string;
  outcome?: EventOutcome;
  from?: Date;
  to?: Date;
  limit?: number;
  cursor?: string;
};

export type EventSummary = {
  id: string;
  occurredAt: Date;
  level: EventLevel;
  origin: string;
  action: string;
  actorId: string | null;
  actorType: string | null;
  outcome: EventOutcome;
  summary: string;
  detail: Record<string, unknown> | null;
  errorCode: string | null;
  errorMessage: string | null;
  durationMs: number;
};

export type ListEventsResult = OperationResult<{ entries: EventSummary[]; hasMore: boolean }>;
