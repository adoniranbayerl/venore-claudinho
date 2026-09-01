import type { HelpdeskValidationError } from "../../../shared/validation-error";
import type { UpdateKioskInput } from "./types";

export function validateUpdateKioskInput(input: UpdateKioskInput): HelpdeskValidationError | null {
  if (!input.kioskId || input.kioskId.trim().length === 0) {
    return { code: "helpdesk.update-kiosk.missing_kiosk", message: "Quiosque não informado." };
  }
  if (input.label.trim().length === 0) {
    return { code: "helpdesk.update-kiosk.invalid_label", message: "O nome do quiosque não pode ser vazio." };
  }
  if (input.label.trim().length > 80) {
    return { code: "helpdesk.update-kiosk.label_too_long", message: "O nome do quiosque deve ter no máximo 80 caracteres." };
  }
  if (input.defaultLocation && input.defaultLocation.trim().length > 160) {
    return { code: "helpdesk.update-kiosk.location_too_long", message: "O local padrão deve ter no máximo 160 caracteres." };
  }
  return null;
}
