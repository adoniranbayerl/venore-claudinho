import { and, asc, eq, inArray, isNull, type SQL } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { metricDefinitions } from "../../../database/schema";
import type { MetricDefinitionRecord } from "../../../contracts/types";

export async function findMetricDefinitions(filter: {
  sectorId?: string;
  sectorIds?: string[];
  includeArchived: boolean;
}): Promise<MetricDefinitionRecord[]> {
  const conditions: SQL[] = [];
  if (!filter.includeArchived) conditions.push(isNull(metricDefinitions.archivedAt));
  if (filter.sectorId) conditions.push(eq(metricDefinitions.sectorId, filter.sectorId));
  else if (filter.sectorIds) {
    if (filter.sectorIds.length === 0) return [];
    conditions.push(inArray(metricDefinitions.sectorId, filter.sectorIds));
  }

  const rows = await db
    .select()
    .from(metricDefinitions)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(metricDefinitions.sectorId), asc(metricDefinitions.position), asc(metricDefinitions.createdAt));
  return rows as MetricDefinitionRecord[];
}
