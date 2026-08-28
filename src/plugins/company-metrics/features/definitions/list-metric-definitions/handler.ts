import { authorizeSectorActor, resolveManageableSectors } from "../../../shared/scoped-authorization";
import { listMetricDefinitions } from "./service";
import type { ListMetricDefinitionsResult } from "./types";

// Com sectorId → métricas de um setor (qualquer membro vê). Sem sectorId → métricas de todos os
// setores visíveis ao ator.
export async function listMetricDefinitionsHandler(options?: {
  sectorId?: string;
  includeArchived?: boolean;
}): Promise<ListMetricDefinitionsResult> {
  if (options?.sectorId && options.sectorId.trim().length > 0) {
    const authz = await authorizeSectorActor(options.sectorId, "viewer");
    if (!authz.authorized) {
      return { success: false, error: authz.error };
    }
    return listMetricDefinitions({ sectorId: options.sectorId, includeArchived: options.includeArchived });
  }

  const visible = await resolveManageableSectors();
  if (visible.scope === "none") {
    return { success: false, error: { code: "company-metrics.list-metric-definitions.forbidden", message: "Você não tem acesso a Métricas Internas." } };
  }
  return listMetricDefinitions({
    sectorIds: visible.scope === "scoped" ? visible.sectorIds : undefined,
    includeArchived: options?.includeArchived,
  });
}
