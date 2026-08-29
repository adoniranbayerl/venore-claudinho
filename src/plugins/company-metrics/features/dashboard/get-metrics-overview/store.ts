import { and, asc, eq, inArray, isNull, max, type SQL } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { metricDefinitions, metricValues, sectors } from "../../../database/schema";
import type { SectorRecord } from "../../../contracts/types";

export async function findActiveSectors(sectorIds?: string[]): Promise<SectorRecord[]> {
  const conditions: SQL[] = [isNull(sectors.archivedAt)];
  if (sectorIds) {
    if (sectorIds.length === 0) return [];
    conditions.push(inArray(sectors.id, sectorIds));
  }
  const rows = await db
    .select()
    .from(sectors)
    .where(and(...conditions))
    .orderBy(asc(sectors.position), asc(sectors.createdAt));
  return rows as SectorRecord[];
}

export async function findLastUpdateBySector(sectorIds: string[]): Promise<Map<string, Date>> {
  if (sectorIds.length === 0) return new Map();
  const rows = await db
    .select({ sectorId: metricDefinitions.sectorId, latest: max(metricValues.updatedAt) })
    .from(metricValues)
    .innerJoin(metricDefinitions, eq(metricValues.definitionId, metricDefinitions.id))
    .where(inArray(metricDefinitions.sectorId, sectorIds))
    .groupBy(metricDefinitions.sectorId);
  return new Map(rows.filter((row) => row.latest).map((row) => [row.sectorId, new Date(row.latest as string | number | Date)]));
}
