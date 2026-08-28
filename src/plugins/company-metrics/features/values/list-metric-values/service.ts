import { isValidCivilDate } from "../../../shared/period";
import { findMetricValues } from "./store";
import type { ListMetricValuesQuery, ListMetricValuesResult } from "./types";

export async function listMetricValues(query: ListMetricValuesQuery): Promise<ListMetricValuesResult> {
  if (!isValidCivilDate(query.from) || !isValidCivilDate(query.to)) {
    return { success: false, error: { code: "company-metrics.list-metric-values.invalid_range", message: "Intervalo de datas inválido." } };
  }
  return { success: true, data: await findMetricValues(query) };
}
