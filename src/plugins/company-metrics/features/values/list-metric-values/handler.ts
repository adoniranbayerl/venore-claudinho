import { authorizeSectorActor, resolveManageableSectors } from "../../../shared/scoped-authorization";
import { listMetricValues } from "./service";
import type { ListMetricValuesQuery, ListMetricValuesResult } from "./types";

// Com sectorId → valores de um setor (qualquer membro vê). Sem sectorId → só company-metrics.manage
// (leitura ampla); um contribuidor escopado precisa informar o setor.
export async function listMetricValuesHandler(query: ListMetricValuesQuery): Promise<ListMetricValuesResult> {
  if (query.sectorId && query.sectorId.trim().length > 0) {
    const authz = await authorizeSectorActor(query.sectorId, "viewer");
    if (!authz.authorized) {
      return { success: false, error: authz.error };
    }
    return listMetricValues(query);
  }

  const visible = await resolveManageableSectors();
  if (visible.scope !== "all") {
    return {
      success: false,
      error: { code: "company-metrics.list-metric-values.sector_required", message: "Informe o setor." },
    };
  }
  return listMetricValues(query);
}
