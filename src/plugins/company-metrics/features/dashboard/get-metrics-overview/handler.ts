import { resolveViewableSectors } from "../../../shared/scoped-authorization";
import { getMetricsOverview } from "./service";
import type { GetMetricsOverviewResult } from "./types";

export async function getMetricsOverviewHandler(): Promise<GetMetricsOverviewResult> {
  const visible = await resolveViewableSectors();
  if (visible.scope === "none") {
    return { success: false, error: { code: "company-metrics.get-metrics-overview.forbidden", message: "Você não tem acesso a Métricas Internas." } };
  }
  return getMetricsOverview({ sectorIds: visible.scope === "scoped" ? visible.sectorIds : undefined });
}
