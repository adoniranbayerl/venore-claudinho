import type { CompanyMetricsValidationError } from "../../../shared/validation-error";
import type { CreateSectorInput } from "./types";

export function validateCreateSectorInput(input: CreateSectorInput): CompanyMetricsValidationError | null {
  if (input.name.trim().length === 0) {
    return { code: "company-metrics.create-sector.invalid_name", message: "O nome do setor não pode ser vazio." };
  }
  if (input.name.trim().length > 80) {
    return { code: "company-metrics.create-sector.name_too_long", message: "O nome do setor deve ter no máximo 80 caracteres." };
  }
  return null;
}
