import type { EnrollmentDashboardValidationError } from "../../../shared/validation-error";
import type { UpdateProgramInput } from "./types";

function isValidCount(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

export function validateUpdateProgramInput(input: UpdateProgramInput): EnrollmentDashboardValidationError | null {
  if (input.programId.trim().length === 0) {
    return { code: "enrollment-dashboard.invalid_program_id", message: "Turma/curso inválido." };
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
