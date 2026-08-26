import type { EnrollmentDashboardValidationError } from "../../../shared/validation-error";
import type { UpdateInstitutionInput } from "./types";

export function validateUpdateInstitutionInput(input: UpdateInstitutionInput): EnrollmentDashboardValidationError | null {
  if (input.institutionId.trim().length === 0) {
    return { code: "enrollment-dashboard.invalid_institution_id", message: "Instituição inválida." };
  }
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
