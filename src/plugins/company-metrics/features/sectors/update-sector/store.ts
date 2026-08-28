import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { sectors } from "../../../database/schema";
import type { SectorRecord } from "../../../contracts/types";

export async function findSectorById(id: string): Promise<SectorRecord | null> {
  const [row] = await db.select().from(sectors).where(eq(sectors.id, id)).limit(1);
  return (row as SectorRecord) ?? null;
}

export async function updateSectorRow(
  id: string,
  patch: { name: string; description: string | null; icon: string | null },
): Promise<SectorRecord> {
  const [row] = await db
    .update(sectors)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(sectors.id, id))
    .returning();
  return row as SectorRecord;
}
