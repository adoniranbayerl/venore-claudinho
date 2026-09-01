import { MAX_TICKET_ATTACHMENTS_PER_SCOPE } from "../../../contracts/types";
import type { HelpdeskValidationError } from "../../../shared/validation-error";
import type { OpenTicketInput } from "./types";

export function validateOpenTicketInput(input: OpenTicketInput): HelpdeskValidationError | null {
  if (!input.queueId || input.queueId.trim().length === 0) {
    return { code: "helpdesk.open-ticket.missing_queue", message: "Escolha uma fila para o chamado." };
  }
  if (input.title.trim().length === 0) {
    return { code: "helpdesk.open-ticket.invalid_title", message: "O título do chamado não pode ser vazio." };
  }
  if (input.title.trim().length > 160) {
    return { code: "helpdesk.open-ticket.title_too_long", message: "O título deve ter no máximo 160 caracteres." };
  }
  if (input.description.trim().length === 0) {
    return { code: "helpdesk.open-ticket.invalid_description", message: "Descreva o problema para abrir o chamado." };
  }
  if (input.description.trim().length > 5000) {
    return { code: "helpdesk.open-ticket.description_too_long", message: "A descrição deve ter no máximo 5000 caracteres." };
  }
  if ((input.attachmentMediaIds?.length ?? 0) > MAX_TICKET_ATTACHMENTS_PER_SCOPE) {
    return {
      code: "helpdesk.open-ticket.too_many_attachments",
      message: `Anexe no máximo ${MAX_TICKET_ATTACHMENTS_PER_SCOPE} fotos ao abrir o chamado.`,
    };
  }
  return null;
}
