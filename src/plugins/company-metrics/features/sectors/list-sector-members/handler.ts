import { authorizeSectorConfigActor } from "../../../shared/scoped-authorization";
import { listSectorMembers } from "./service";
import type { ListSectorMembersResult } from "./types";

export async function listSectorMembersHandler(sectorId: string): Promise<ListSectorMembersResult> {
  if (!sectorId || sectorId.trim().length === 0) {
    return { success: false, error: { code: "company-metrics.list-sector-members.missing_sector", message: "Setor não informado." } };
  }

  const authz = await authorizeSectorConfigActor(sectorId);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listSectorMembers(sectorId);
}
