import { authorizeSectorActor } from "../../../shared/scoped-authorization";
import { getTargetRollups } from "./service";
import type { GetTargetRollupsResult } from "./types";

export async function getTargetRollupsHandler(sectorId: string): Promise<GetTargetRollupsResult> {
  if (!sectorId || sectorId.trim().length === 0) {
    return { success: false, error: { code: "company-metrics.get-target-rollups.missing_sector", message: "Setor não informado." } };
  }

  const authz = await authorizeSectorActor(sectorId, "viewer");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return getTargetRollups(sectorId);
}
