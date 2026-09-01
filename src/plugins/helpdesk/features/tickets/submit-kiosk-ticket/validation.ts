import type { HelpdeskValidationError } from "../../../shared/validation-error";
import type { SubmitKioskTicketInput } from "./types";

// Formulário curto do quiosque (§2.5): descrição obrigatória, local/contato opcionais, sem título
// (o service deriva um a partir da descrição). Fotos ficaram para a Fase 8 — ver §8.
export function validateSubmitKioskTicketInput(input: SubmitKioskTicketInput): HelpdeskValidationError | null {
  if (!input.token || input.token.trim().length === 0) {
    return { code: "helpdesk.submit-kiosk-ticket.missing_token", message: "Quiosque não identificado." };
  }
  if (input.description.trim().length === 0) {
    return { code: "helpdesk.submit-kiosk-ticket.invalid_description", message: "Descreva o problema para enviar o chamado." };
  }
  if (input.description.trim().length > 3000) {
    return { code: "helpdesk.submit-kiosk-ticket.description_too_long", message: "A descrição deve ter no máximo 3000 caracteres." };
  }
  if (input.location && input.location.trim().length > 160) {
    return { code: "helpdesk.submit-kiosk-ticket.location_too_long", message: "O local deve ter no máximo 160 caracteres." };
  }
  if (input.contact && input.contact.trim().length > 160) {
    return { code: "helpdesk.submit-kiosk-ticket.contact_too_long", message: "O contato deve ter no máximo 160 caracteres." };
  }
  if (input.requesterName && input.requesterName.trim().length > 120) {
    return { code: "helpdesk.submit-kiosk-ticket.name_too_long", message: "O nome deve ter no máximo 120 caracteres." };
  }
  return null;
}
