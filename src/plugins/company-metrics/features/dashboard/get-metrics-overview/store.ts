import { and, asc, inArray, isNull, type SQL } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { sectors } from "../../../database/schema";
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
