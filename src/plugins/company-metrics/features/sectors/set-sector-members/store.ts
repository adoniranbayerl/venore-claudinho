import { and, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { sectorMembers, sectors } from "../../../database/schema";
import type { SectorMemberRole, SectorRecord } from "../../../contracts/types";
import type { SectorMemberAssignment } from "./types";

export async function findSectorById(id: string): Promise<SectorRecord | null> {
  const [row] = await db.select().from(sectors).where(eq(sectors.id, id)).limit(1);
  return (row as SectorRecord) ?? null;
}

export async function findAdminUserIds(sectorId: string): Promise<string[]> {
  const rows = await db
    .select({ userId: sectorMembers.userId })
    .from(sectorMembers)
    .where(and(eq(sectorMembers.sectorId, sectorId), eq(sectorMembers.role, "admin")));
  return rows.map((row) => row.userId);
}

// Substitui o conjunto inteiro de membros do setor — mesmo padrão de
// broadcast set-agenda-editors/store.ts (replaceAgendaEditors). members=[] é estado válido.
export async function replaceSectorMembers(sectorId: string, members: SectorMemberAssignment[]): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(sectorMembers).where(eq(sectorMembers.sectorId, sectorId));
    if (members.length > 0) {
      await tx.insert(sectorMembers).values(members.map((member) => ({ sectorId, userId: member.userId, role: member.role as SectorMemberRole })));
    }
  });
}
