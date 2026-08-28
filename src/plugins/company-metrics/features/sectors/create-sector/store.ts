import { eq, max } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { sectors } from "../../../database/schema";
import type { SectorRecord } from "../../../contracts/types";

export async function sectorKeyExists(key: string): Promise<boolean> {
  const [row] = await db.select({ id: sectors.id }).from(sectors).where(eq(sectors.key, key)).limit(1);
  return Boolean(row);
}

export async function nextSectorPosition(): Promise<number> {
  const [row] = await db.select({ maxPosition: max(sectors.position) }).from(sectors);
  return (row?.maxPosition ?? 0) + 1;
}

export async function insertSector(input: {
  key: string;
  name: string;
  description: string | null;
  icon: string | null;
  position: number;
}): Promise<SectorRecord> {
  const [row] = await db.insert(sectors).values(input).returning();
  return row as SectorRecord;
}
