import type { EnrollmentDashboardValidationError } from "../../../shared/validation-error";
import type { CreateInstitutionInput } from "./types";

export function validateCreateInstitutionInput(input: CreateInstitutionInput): EnrollmentDashboardValidationError | null {
  if (input.name.trim().length === 0) {
    return { code: "enrollment-dashboard.invalid_name", message: "O nome da instituição não pode ser vazio." };
  }
  if (input.programLabel.trim().length === 0) {
    return {
      code: "enrollment-dashboard.invalid_program_label",
      message: "Informe como chamar cada turma/curso desta instituição (ex.: Turma, Curso).",
    };
  }
  return null;
}
