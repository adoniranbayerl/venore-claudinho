import type { CompanyMetricsValidationError } from "../../../shared/validation-error";
import type { UpdateSectorInput } from "./types";

export function validateUpdateSectorInput(input: UpdateSectorInput): CompanyMetricsValidationError | null {
  if (input.sectorId.trim().length === 0) {
    return { code: "company-metrics.update-sector.missing_sector", message: "Setor não informado." };
  }
  if (input.name.trim().length === 0) {
    return { code: "company-metrics.update-sector.invalid_name", message: "O nome do setor não pode ser vazio." };
  }
  if (input.name.trim().length > 80) {
    return { code: "company-metrics.update-sector.name_too_long", message: "O nome do setor deve ter no máximo 80 caracteres." };
  }
  return null;
}
