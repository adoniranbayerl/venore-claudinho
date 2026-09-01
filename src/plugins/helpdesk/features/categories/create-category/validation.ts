import type { HelpdeskValidationError } from "../../../shared/validation-error";
import type { CreateCategoryInput } from "./types";

export function validateCreateCategoryInput(input: CreateCategoryInput): HelpdeskValidationError | null {
  if (!input.queueId || input.queueId.trim().length === 0) {
    return { code: "helpdesk.create-category.missing_queue", message: "Fila não informada." };
  }
  if (input.label.trim().length === 0) {
    return { code: "helpdesk.create-category.invalid_label", message: "O nome da categoria não pode ser vazio." };
  }
  if (input.label.trim().length > 60) {
    return { code: "helpdesk.create-category.label_too_long", message: "O nome da categoria deve ter no máximo 60 caracteres." };
  }
  return null;
}
