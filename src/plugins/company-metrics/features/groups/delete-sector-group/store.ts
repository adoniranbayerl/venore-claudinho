import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { sectorGroups } from "../../../database/schema";
import type { SectorGroupRecord } from "../../../contracts/types";

export async function findSectorGroupById(id: string): Promise<SectorGroupRecord | null> {
  const [row] = await db.select().from(sectorGroups).where(eq(sectorGroups.id, id)).limit(1);
  return (row as SectorGroupRecord) ?? null;
}

// Fases 2/3 adicionam metric_definitions.group_id / targets.group_id com onDelete "set null" —
// apagar um grupo só desvincula as métricas/metas, nunca as apaga.
export async function deleteSectorGroupById(id: string): Promise<void> {
  await db.delete(sectorGroups).where(eq(sectorGroups.id, id));
}
