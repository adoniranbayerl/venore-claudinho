import { authorizeSectorActor, resolveManageableSectors } from "../../../shared/scoped-authorization";
import { listTargets } from "./service";
import type { ListTargetsResult } from "./types";

export async function listTargetsHandler(options?: {
  sectorId?: string;
  includeArchived?: boolean;
}): Promise<ListTargetsResult> {
  if (options?.sectorId && options.sectorId.trim().length > 0) {
    const authz = await authorizeSectorActor(options.sectorId, "viewer");
    if (!authz.authorized) {
      return { success: false, error: authz.error };
    }
    return listTargets({ sectorId: options.sectorId, includeArchived: options.includeArchived });
  }

  const visible = await resolveManageableSectors();
  if (visible.scope === "none") {
    return { success: false, error: { code: "company-metrics.list-targets.forbidden", message: "Você não tem acesso a Métricas Internas." } };
  }
  return listTargets({
    sectorIds: visible.scope === "scoped" ? visible.sectorIds : undefined,
    includeArchived: options?.includeArchived,
  });
}
