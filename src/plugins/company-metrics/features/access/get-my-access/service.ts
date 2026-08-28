import { findMembershipsForUser } from "./store";
import type { CompanyMetricsAccess } from "./types";

const RANK: Record<string, number> = { viewer: 1, editor: 2, admin: 3 };

export async function buildAccessForActor(actorId: string, canManageAll: boolean): Promise<CompanyMetricsAccess> {
  const memberships = await findMembershipsForUser(actorId);
  return {
    canManageAll,
    adminSectorIds: memberships.filter((m) => m.role === "admin").map((m) => m.sectorId),
    contributorSectorIds: memberships.filter((m) => RANK[m.role] >= RANK.editor).map((m) => m.sectorId),
    memberSectorIds: memberships.map((m) => m.sectorId),
  };
}
