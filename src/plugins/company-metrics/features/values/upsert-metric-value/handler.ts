import { authorizeMetricValueContributionActor } from "../../../shared/scoped-authorization";
import { upsertMetricValueForPeriod } from "./service";
import type { UpsertMetricValueInput, UpsertMetricValueResult } from "./types";

// Lançar/editar/limpar um valor = papel "editor" pra cima no setor dono da métrica (ou
// company-metrics.manage).
export async function upsertMetricValueHandler(input: UpsertMetricValueInput): Promise<UpsertMetricValueResult> {
  if (!input.definitionId || input.definitionId.trim().length === 0) {
    return { success: false, error: { code: "company-metrics.upsert-metric-value.missing_definition", message: "Métrica não informada." } };
  }

  const authz = await authorizeMetricValueContributionActor(input.definitionId);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return upsertMetricValueForPeriod({ ...input, actorId: authz.actorId });
}
