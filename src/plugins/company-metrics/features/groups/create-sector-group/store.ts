import { and, eq, max } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { sectorGroups, sectors } from "../../../database/schema";
import type { SectorGroupRecord } from "../../../contracts/types";

export async function sectorExists(sectorId: string): Promise<boolean> {
  const [row] = await db.select({ id: sectors.id }).from(sectors).where(eq(sectors.id, sectorId)).limit(1);
  return Boolean(row);
}

export async function groupKeyExists(sectorId: string, key: string): Promise<boolean> {
  const [row] = await db
    .select({ id: sectorGroups.id })
    .from(sectorGroups)
    .where(and(eq(sectorGroups.sectorId, sectorId), eq(sectorGroups.key, key)))
    .limit(1);
  return Boolean(row);
}

export async function nextGroupPosition(sectorId: string): Promise<number> {
  const [row] = await db.select({ maxPosition: max(sectorGroups.position) }).from(sectorGroups).where(eq(sectorGroups.sectorId, sectorId));
  return (row?.maxPosition ?? 0) + 1;
}

export async function insertSectorGroup(input: {
  sectorId: string;
  key: string;
  label: string;
  logoMediaId: string | null;
  position: number;
}): Promise<SectorGroupRecord> {
  const [row] = await db.insert(sectorGroups).values(input).returning();
  return row as SectorGroupRecord;
}
