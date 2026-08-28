import { TARGET_CLASSIFICATIONS, type TargetClassification } from "../../../contracts/types";
import type { CompanyMetricsValidationError } from "../../../shared/validation-error";
import { isValidCivilDate } from "../../../shared/period";

export type TargetInputDraft = { definitionId: string; weight: number; classification: TargetClassification };

export type TargetCoreFields = {
  label: string;
  targetValue: number;
  periodStart: string;
  periodEnd: string;
  onTrackThreshold: number;
  inputs: TargetInputDraft[];
};

// Validação compartilhada entre create-target e update-target.
export function validateTargetCoreFields(fields: TargetCoreFields): CompanyMetricsValidationError | null {
  if (fields.label.trim().length === 0) {
    return { code: "company-metrics.target.invalid_label", message: "O nome da meta não pode ser vazio." };
  }
  if (!Number.isFinite(fields.targetValue) || fields.targetValue <= 0) {
    return { code: "company-metrics.target.invalid_value", message: "O valor da meta deve ser um número maior que zero." };
  }
  if (!isValidCivilDate(fields.periodStart) || !isValidCivilDate(fields.periodEnd)) {
    return { code: "company-metrics.target.invalid_period", message: "Período da meta inválido." };
  }
  if (fields.periodStart > fields.periodEnd) {
    return { code: "company-metrics.target.period_order", message: "O início do período não pode ser depois do fim." };
  }
  if (!Number.isFinite(fields.onTrackThreshold) || fields.onTrackThreshold <= 0 || fields.onTrackThreshold > 1) {
    return { code: "company-metrics.target.invalid_threshold", message: "O limiar de 'no ritmo' deve estar entre 0 e 1 (ex.: 0,85)." };
  }
  if (fields.inputs.length === 0) {
    return { code: "company-metrics.target.no_inputs", message: "Adicione ao menos uma métrica à composição da meta." };
  }
  const seen = new Set<string>();
  for (const input of fields.inputs) {
    if (!input.definitionId || input.definitionId.trim().length === 0) {
      return { code: "company-metrics.target.input_missing_definition", message: "Uma linha da composição está sem métrica." };
    }
    if (seen.has(input.definitionId)) {
      return { code: "company-metrics.target.input_duplicate", message: "A mesma métrica aparece mais de uma vez na composição." };
    }
    seen.add(input.definitionId);
    if (!(TARGET_CLASSIFICATIONS as readonly string[]).includes(input.classification)) {
      return { code: "company-metrics.target.input_bad_classification", message: "Classificação de métrica inválida." };
    }
    if (!Number.isFinite(input.weight) || input.weight <= 0) {
      return { code: "company-metrics.target.input_bad_weight", message: "O peso de cada métrica deve ser maior que zero." };
    }
  }
  return null;
}
