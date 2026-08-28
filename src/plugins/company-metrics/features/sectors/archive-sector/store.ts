import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { sectors } from "../../../database/schema";
import type { SectorRecord } from "../../../contracts/types";

export async function findSectorById(id: string): Promise<SectorRecord | null> {
  const [row] = await db.select().from(sectors).where(eq(sectors.id, id)).limit(1);
  return (row as SectorRecord) ?? null;
}

export async function setSectorArchivedAt(id: string, archivedAt: Date | null): Promise<SectorRecord> {
  const [row] = await db
    .update(sectors)
    .set({ archivedAt, updatedAt: new Date() })
    .where(eq(sectors.id, id))
    .returning();
  return row as SectorRecord;
}
