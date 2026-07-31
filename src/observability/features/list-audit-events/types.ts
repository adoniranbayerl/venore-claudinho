import type { OperationResult } from "@/shared/types";
import type { EventOutcome } from "../../contracts/types";

export type ListAuditEventsQuery = {
  actorId?: string;
  outcome?: EventOutcome;
  from?: Date;
  to?: Date;
  limit?: number;
  cursor?: string;
};

export type AuditEventSummary = {
  id: string;
  occurredAt: Date;
  action: string;
  actorId: string | null;
  actorType: string | null;
  outcome: EventOutcome;
  summary: string;
  detail: Record<string, unknown> | null;
};

export type ListAuditEventsResult = OperationResult<{ entries: AuditEventSummary[]; hasMore: boolean }>;
