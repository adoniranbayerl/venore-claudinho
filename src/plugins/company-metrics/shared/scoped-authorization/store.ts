import { and, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { sectorGroups, sectorMembers, sectors } from "../../database/schema";
import type { SectorMemberRole, SectorRecord } from "../../contracts/types";

// Acesso a banco fora de um store.ts por feature — exceção deliberada, mesmo racional de
// broadcast/shared/scoped-authorization/store.ts: esta checagem de "é membro deste setor e com
// que papel" é usada por handlers espalhados por várias features (sectors, groups, e depois
// definitions/values/targets), e nenhuma é dona natural dela.

const ROLE_RANK: Record<SectorMemberRole, number> = { viewer: 1, editor: 2, admin: 3 };

export function roleSatisfies(actual: SectorMemberRole | null, min: SectorMemberRole): boolean {
  return actual !== null && ROLE_RANK[actual] >= ROLE_RANK[min];
}

export async function findSectorMemberRole(sectorId: string, userId: string): Promise<SectorMemberRole | null> {
  const [row] = await db
    .select({ role: sectorMembers.role })
    .from(sectorMembers)
    .where(and(eq(sectorMembers.sectorId, sectorId), eq(sectorMembers.userId, userId)))
    .limit(1);
  return (row?.role as SectorMemberRole) ?? null;
}

// Setores em que a pessoa é membro com papel >= minRole. Usado pelas listagens quando o ator só
// tem a permission estreita (company-metrics.contribute), não a ampla (company-metrics.manage).
export async function findSectorIdsForUser(userId: string, minRole: SectorMemberRole = "viewer"): Promise<string[]> {
  const rows = await db
    .select({ sectorId: sectorMembers.sectorId, role: sectorMembers.role })
    .from(sectorMembers)
    .where(eq(sectorMembers.userId, userId));
  return rows.filter((row) => roleSatisfies(row.role as SectorMemberRole, minRole)).map((row) => row.sectorId);
}

export async function findSectorById(id: string): Promise<SectorRecord | null> {
  const [row] = await db.select().from(sectors).where(eq(sectors.id, id)).limit(1);
  return (row as SectorRecord) ?? null;
}

// update-sector-group/delete-sector-group só recebem groupId — resolve o setor pai antes de
// checar autorização (mesmo padrão de broadcast findAgendaIdByEventId).
export async function findSectorIdByGroupId(groupId: string): Promise<string | null> {
  const [row] = await db.select({ sectorId: sectorGroups.sectorId }).from(sectorGroups).where(eq(sectorGroups.id, groupId)).limit(1);
  return row?.sectorId ?? null;
}
