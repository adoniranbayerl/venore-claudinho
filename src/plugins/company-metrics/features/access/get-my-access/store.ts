import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { sectorMembers } from "../../../database/schema";
import type { SectorMemberRole } from "../../../contracts/types";

export async function findMembershipsForUser(userId: string): Promise<{ sectorId: string; role: SectorMemberRole }[]> {
  const rows = await db
    .select({ sectorId: sectorMembers.sectorId, role: sectorMembers.role })
    .from(sectorMembers)
    .where(eq(sectorMembers.userId, userId));
  return rows.map((row) => ({ sectorId: row.sectorId, role: row.role as SectorMemberRole }));
}
