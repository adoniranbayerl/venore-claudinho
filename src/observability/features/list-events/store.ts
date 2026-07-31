import { and, count, desc, eq, gte, lt, lte } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { observabilityEvents } from "../../database/schema";
import type { EventSummary, ListEventsQuery } from "./types";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

function buildConditions(query: ListEventsQuery) {
  const conditions = [];
  if (query.level) conditions.push(eq(observabilityEvents.level, query.level));
  if (query.origin) conditions.push(eq(observabilityEvents.origin, query.origin));
  if (query.actorId) conditions.push(eq(observabilityEvents.actorId, query.actorId));
  if (query.outcome) conditions.push(eq(observabilityEvents.outcome, query.outcome));
  if (query.from) conditions.push(gte(observabilityEvents.occurredAt, query.from));
  if (query.to) conditions.push(lte(observabilityEvents.occurredAt, query.to));
  return conditions;
}

export async function findEvents(query: ListEventsQuery): Promise<{ entries: EventSummary[]; hasMore: boolean }> {
  const limit = Math.min(query.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const conditions = buildConditions(query);

  if (query.cursor) {
    const cursorRows = await db
      .select({ occurredAt: observabilityEvents.occurredAt })
      .from(observabilityEvents)
      .where(eq(observabilityEvents.id, query.cursor))
      .limit(1);
    const cursorRow = cursorRows[0];
    if (cursorRow) {
      conditions.push(lt(observabilityEvents.occurredAt, cursorRow.occurredAt));
    }
  }

  const rows = await db
    .select()
    .from(observabilityEvents)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(observabilityEvents.occurredAt))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  return {
    entries: rows.slice(0, limit).map((row) => ({
      id: row.id,
      occurredAt: row.occurredAt,
      level: row.level as EventSummary["level"],
      origin: row.origin,
      action: row.action,
      actorId: row.actorId,
      actorType: row.actorType,
      outcome: row.outcome as EventSummary["outcome"],
      summary: row.summary,
      detail: row.detail ?? null,
      errorCode: row.errorCode,
      errorMessage: row.errorMessage,
      durationMs: row.durationMs,
    })),
    hasMore,
  };
}

// Sempre com teto (nenhuma consulta sem limite) — usado pela confirmação do botão "limpar" e,
// potencialmente, por telemetria futura. Reaplica os mesmos filtros de findEvents, exceto cursor.
export async function countEvents(query: Omit<ListEventsQuery, "cursor" | "limit"> = {}): Promise<number> {
  const conditions = buildConditions(query);
  const rows = await db
    .select({ value: count() })
    .from(observabilityEvents)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
  return rows[0]?.value ?? 0;
}
