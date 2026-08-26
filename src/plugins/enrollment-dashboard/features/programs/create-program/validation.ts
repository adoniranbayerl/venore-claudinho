import type { EnrollmentDashboardValidationError } from "../../../shared/validation-error";
import type { CreateProgramInput } from "./types";

function isValidCount(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

export function validateCreateProgramInput(input: CreateProgramInput): EnrollmentDashboardValidationError | null {
  if (input.institutionId.trim().length === 0) {
    return { code: "enrollment-dashboard.invalid_institution_id", message: "Instituição inválida." };
  }
  if (input.label.trim().length === 0) {
    return { code: "enrollment-dashboard.invalid_label", message: "O nome da turma/curso não pode ser vazio." };
  }
  if (!isValidCount(input.goal) || !isValidCount(input.renewed) || !isValidCount(input.newEnrollments)) {
    return {
      code: "enrollment-dashboard.invalid_counts",
      message: "Meta, rematrículas e novas matrículas precisam ser números inteiros de 0 em diante.",
    };
  }
  return null;
}
