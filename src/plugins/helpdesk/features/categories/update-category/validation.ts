import type { HelpdeskValidationError } from "../../../shared/validation-error";
import type { UpdateCategoryInput } from "./types";

export function validateUpdateCategoryInput(input: UpdateCategoryInput): HelpdeskValidationError | null {
  if (!input.categoryId || input.categoryId.trim().length === 0) {
    return { code: "helpdesk.update-category.missing_category", message: "Categoria não informada." };
  }
  if (input.label.trim().length === 0) {
    return { code: "helpdesk.update-category.invalid_label", message: "O nome da categoria não pode ser vazio." };
  }
  if (input.label.trim().length > 60) {
    return { code: "helpdesk.update-category.label_too_long", message: "O nome da categoria deve ter no máximo 60 caracteres." };
  }
  return null;
}
