import { asc, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { sectorMembers } from "../../../database/schema";
import type { SectorMemberRecord } from "../../../contracts/types";

export async function findSectorMembers(sectorId: string): Promise<SectorMemberRecord[]> {
  const rows = await db
    .select()
    .from(sectorMembers)
    .where(eq(sectorMembers.sectorId, sectorId))
    .orderBy(asc(sectorMembers.role), asc(sectorMembers.assignedAt));
  return rows as SectorMemberRecord[];
}
