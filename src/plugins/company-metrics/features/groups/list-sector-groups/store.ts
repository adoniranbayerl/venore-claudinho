import { asc, eq, inArray, type SQL } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { sectorGroups } from "../../../database/schema";
import type { SectorGroupRecord } from "../../../contracts/types";

export async function findSectorGroups(filter: { sectorId?: string; sectorIds?: string[] }): Promise<SectorGroupRecord[]> {
  let where: SQL | undefined;
  if (filter.sectorId) where = eq(sectorGroups.sectorId, filter.sectorId);
  else if (filter.sectorIds) {
    if (filter.sectorIds.length === 0) return [];
    where = inArray(sectorGroups.sectorId, filter.sectorIds);
  }

  const rows = await db
    .select()
    .from(sectorGroups)
    .where(where)
    .orderBy(asc(sectorGroups.sectorId), asc(sectorGroups.position), asc(sectorGroups.createdAt));
  return rows as SectorGroupRecord[];
}
