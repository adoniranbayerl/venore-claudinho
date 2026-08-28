import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { sectorGroups } from "../../../database/schema";
import type { SectorGroupRecord } from "../../../contracts/types";

export async function findSectorGroupById(id: string): Promise<SectorGroupRecord | null> {
  const [row] = await db.select().from(sectorGroups).where(eq(sectorGroups.id, id)).limit(1);
  return (row as SectorGroupRecord) ?? null;
}

export async function updateSectorGroupRow(
  id: string,
  patch: { label: string; logoMediaId: string | null },
): Promise<SectorGroupRecord> {
  const [row] = await db
    .update(sectorGroups)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(sectorGroups.id, id))
    .returning();
  return row as SectorGroupRecord;
}
