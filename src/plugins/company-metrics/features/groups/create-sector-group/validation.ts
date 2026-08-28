import type { CompanyMetricsValidationError } from "../../../shared/validation-error";
import type { CreateSectorGroupInput } from "./types";

export function validateCreateSectorGroupInput(input: CreateSectorGroupInput): CompanyMetricsValidationError | null {
  if (!input.sectorId || input.sectorId.trim().length === 0) {
    return { code: "company-metrics.create-sector-group.missing_sector", message: "Setor não informado." };
  }
  if (input.label.trim().length === 0) {
    return { code: "company-metrics.create-sector-group.invalid_label", message: "O nome do grupo não pode ser vazio." };
  }
  return null;
}
