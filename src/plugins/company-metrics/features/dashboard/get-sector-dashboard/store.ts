import { and, asc, eq, gte, inArray, isNull } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { metricDefinitions, metricValues, sectors } from "../../../database/schema";
import type { MetricDefinitionRecord, MetricValueRecord, SectorRecord } from "../../../contracts/types";

export async function findSectorById(id: string): Promise<SectorRecord | null> {
  const [row] = await db.select().from(sectors).where(eq(sectors.id, id)).limit(1);
  return (row as SectorRecord) ?? null;
}

export async function findActiveDefinitions(sectorId: string): Promise<MetricDefinitionRecord[]> {
  const rows = await db
    .select()
    .from(metricDefinitions)
    .where(and(eq(metricDefinitions.sectorId, sectorId), isNull(metricDefinitions.archivedAt)))
    .orderBy(asc(metricDefinitions.position), asc(metricDefinitions.createdAt));
  return rows as MetricDefinitionRecord[];
}

export async function findValuesSince(definitionIds: string[], since: string): Promise<MetricValueRecord[]> {
  if (definitionIds.length === 0) return [];
  const rows = await db
    .select()
    .from(metricValues)
    .where(and(inArray(metricValues.definitionId, definitionIds), gte(metricValues.periodStart, since)))
    .orderBy(asc(metricValues.definitionId), asc(metricValues.periodStart));
  return rows as MetricValueRecord[];
}
