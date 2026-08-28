import {
  METRIC_AGGREGATIONS,
  METRIC_DEFINITION_GRANULARITIES,
  METRIC_DIRECTIONS,
  METRIC_UNITS,
} from "../../../contracts/types";
import type { CompanyMetricsValidationError } from "../../../shared/validation-error";
import type { CreateMetricDefinitionInput } from "./types";

export function validateCreateMetricDefinitionInput(
  input: CreateMetricDefinitionInput,
): CompanyMetricsValidationError | null {
  if (!input.sectorId || input.sectorId.trim().length === 0) {
    return { code: "company-metrics.create-metric-definition.missing_sector", message: "Setor não informado." };
  }
  if (input.label.trim().length === 0) {
    return { code: "company-metrics.create-metric-definition.invalid_label", message: "O nome da métrica não pode ser vazio." };
  }
  if (!(METRIC_UNITS as readonly string[]).includes(input.unit)) {
    return { code: "company-metrics.create-metric-definition.invalid_unit", message: "Unidade inválida." };
  }
  if (!(METRIC_AGGREGATIONS as readonly string[]).includes(input.aggregation)) {
    return { code: "company-metrics.create-metric-definition.invalid_aggregation", message: "Forma de consolidação inválida." };
  }
  if (!(METRIC_DEFINITION_GRANULARITIES as readonly string[]).includes(input.granularity)) {
    return { code: "company-metrics.create-metric-definition.invalid_granularity", message: "Cadência inválida." };
  }
  if (!(METRIC_DIRECTIONS as readonly string[]).includes(input.direction)) {
    return { code: "company-metrics.create-metric-definition.invalid_direction", message: "Direção inválida." };
  }
  return null;
}
