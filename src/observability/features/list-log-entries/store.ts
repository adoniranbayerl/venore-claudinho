import { and, desc, eq, lt } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { observabilityLogEntries } from "../../database/schema";
import type { ListLogEntriesQuery, LogEntrySummary } from "./types";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export async function findLogEntries(
  query: ListLogEntriesQuery,
): Promise<{ entries: LogEntrySummary[]; hasMore: boolean }> {
  const limit = Math.min(query.limit ?? DEFAULT_LIMIT, MAX_LIMIT);

  const conditions = [];
  if (query.success !== undefined) {
    conditions.push(eq(observabilityLogEntries.success, query.success));
  }
  if (query.useCase) {
    conditions.push(eq(observabilityLogEntries.useCase, query.useCase));
  }

  if (query.cursor) {
    const cursorRows = await db
      .select({ startedAt: observabilityLogEntries.startedAt })
      .from(observabilityLogEntries)
      .where(eq(observabilityLogEntries.id, query.cursor))
      .limit(1);
    const cursorRow = cursorRows[0];
    if (cursorRow) {
      conditions.push(lt(observabilityLogEntries.startedAt, cursorRow.startedAt));
    }
  }

  const rows = await db
    .select()
    .from(observabilityLogEntries)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(observabilityLogEntries.startedAt))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  return { entries: rows.slice(0, limit), hasMore };
}
