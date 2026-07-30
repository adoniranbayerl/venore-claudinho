import { validateBirthdayDate, type BirthdayValidationError } from "../../shared/validate-birthday-date";
import type { CreateBirthdayInput } from "./types";

export function validateCreateBirthdayInput(input: CreateBirthdayInput): BirthdayValidationError | null {
  if (input.fullName.trim().length === 0) {
    return { code: "birthdays.invalid_full_name", message: "O nome completo não pode ser vazio." };
  }

  return validateBirthdayDate(input.month, input.day);
}
