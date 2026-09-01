import { and, asc, count, inArray, isNull, type SQL } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { categories, queueMembers, queues } from "../../../database/schema";
import type { QueueRecord } from "../../../contracts/types";

export async function findQueues(options: { includeArchived: boolean; queueIds?: string[] }): Promise<QueueRecord[]> {
  const conditions: SQL[] = [];
  if (!options.includeArchived) conditions.push(isNull(queues.archivedAt));
  if (options.queueIds) {
    if (options.queueIds.length === 0) return [];
    conditions.push(inArray(queues.id, options.queueIds));
  }

  const rows = await db
    .select()
    .from(queues)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(queues.position), asc(queues.createdAt), asc(queues.id));
  return rows as QueueRecord[];
}

export async function countMembersByQueue(queueIds: string[]): Promise<Map<string, number>> {
  if (queueIds.length === 0) return new Map();
  const rows = await db
    .select({ queueId: queueMembers.queueId, total: count() })
    .from(queueMembers)
    .where(inArray(queueMembers.queueId, queueIds))
    .groupBy(queueMembers.queueId);
  return new Map(rows.map((row) => [row.queueId, Number(row.total)]));
}

export async function countCategoriesByQueue(queueIds: string[]): Promise<Map<string, number>> {
  if (queueIds.length === 0) return new Map();
  const rows = await db
    .select({ queueId: categories.queueId, total: count() })
    .from(categories)
    .where(and(inArray(categories.queueId, queueIds), isNull(categories.archivedAt)))
    .groupBy(categories.queueId);
  return new Map(rows.map((row) => [row.queueId, Number(row.total)]));
}
