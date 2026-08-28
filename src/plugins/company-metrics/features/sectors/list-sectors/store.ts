import { and, asc, count, inArray, isNull, type SQL } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { sectorGroups, sectorMembers, sectors } from "../../../database/schema";
import type { SectorRecord } from "../../../contracts/types";

export async function findSectors(options: { includeArchived: boolean; sectorIds?: string[] }): Promise<SectorRecord[]> {
  const conditions: SQL[] = [];
  if (!options.includeArchived) conditions.push(isNull(sectors.archivedAt));
  if (options.sectorIds) {
    if (options.sectorIds.length === 0) return [];
    conditions.push(inArray(sectors.id, options.sectorIds));
  }

  const rows = await db
    .select()
    .from(sectors)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(sectors.position), asc(sectors.createdAt), asc(sectors.id));
  return rows as SectorRecord[];
}

export async function countMembersBySector(sectorIds: string[]): Promise<Map<string, number>> {
  if (sectorIds.length === 0) return new Map();
  const rows = await db
    .select({ sectorId: sectorMembers.sectorId, total: count() })
    .from(sectorMembers)
    .where(inArray(sectorMembers.sectorId, sectorIds))
    .groupBy(sectorMembers.sectorId);
  return new Map(rows.map((row) => [row.sectorId, Number(row.total)]));
}

export async function countGroupsBySector(sectorIds: string[]): Promise<Map<string, number>> {
  if (sectorIds.length === 0) return new Map();
  const rows = await db
    .select({ sectorId: sectorGroups.sectorId, total: count() })
    .from(sectorGroups)
    .where(inArray(sectorGroups.sectorId, sectorIds))
    .groupBy(sectorGroups.sectorId);
  return new Map(rows.map((row) => [row.sectorId, Number(row.total)]));
}
