import { MAX_TICKET_ATTACHMENTS_PER_SCOPE } from "../../../contracts/types";
import type { HelpdeskValidationError } from "../../../shared/validation-error";
import type { AddTicketAttachmentInput } from "./types";

export function validateAddTicketAttachmentInput(input: AddTicketAttachmentInput): HelpdeskValidationError | null {
  if (!input.ticketId || input.ticketId.trim().length === 0) {
    return { code: "helpdesk.add-ticket-attachment.missing_ticket", message: "Chamado não informado." };
  }
  const mediaIds = input.mediaIds.filter((id) => id.trim().length > 0);
  if (mediaIds.length === 0) {
    return { code: "helpdesk.add-ticket-attachment.no_media", message: "Nenhum arquivo para anexar." };
  }
  if (mediaIds.length > MAX_TICKET_ATTACHMENTS_PER_SCOPE) {
    return {
      code: "helpdesk.add-ticket-attachment.too_many",
      message: `Anexe no máximo ${MAX_TICKET_ATTACHMENTS_PER_SCOPE} arquivos por vez.`,
    };
  }
  return null;
}
