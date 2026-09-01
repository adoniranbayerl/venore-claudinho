import type { HelpdeskValidationError } from "../../../shared/validation-error";
import type { CreateKioskInput } from "./types";

export function validateCreateKioskInput(input: CreateKioskInput): HelpdeskValidationError | null {
  if (input.label.trim().length === 0) {
    return { code: "helpdesk.create-kiosk.invalid_label", message: "Dê um nome ao quiosque (ex.: Recepção Bloco A)." };
  }
  if (input.label.trim().length > 80) {
    return { code: "helpdesk.create-kiosk.label_too_long", message: "O nome do quiosque deve ter no máximo 80 caracteres." };
  }
  if (input.defaultLocation && input.defaultLocation.trim().length > 160) {
    return { code: "helpdesk.create-kiosk.location_too_long", message: "O local padrão deve ter no máximo 160 caracteres." };
  }
  return null;
}
