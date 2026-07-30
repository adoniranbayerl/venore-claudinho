import { validateBirthdayDate, type BirthdayValidationError } from "../../shared/validate-birthday-date";
import type { UpdateBirthdayInput } from "./types";

export function validateUpdateBirthdayInput(input: UpdateBirthdayInput): BirthdayValidationError | null {
  if (input.birthdayId.trim().length === 0) {
    return { code: "birthdays.invalid_id", message: "birthdayId não pode ser vazio." };
  }

  if (input.fullName.trim().length === 0) {
    return { code: "birthdays.invalid_full_name", message: "O nome completo não pode ser vazio." };
  }

  return validateBirthdayDate(input.month, input.day);
}
