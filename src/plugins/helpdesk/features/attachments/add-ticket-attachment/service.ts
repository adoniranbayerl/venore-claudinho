import { beginOperation, endOperation } from "@/observability";
import { MAX_TICKET_ATTACHMENTS_PER_SCOPE } from "../../../contracts/types";
import { countAttachmentsInScope, eventBelongsToTicket, insertAttachments } from "./store";
import type { AddTicketAttachmentCommand, AddTicketAttachmentResult } from "./types";

export async function addTicketAttachment(command: AddTicketAttachmentCommand): Promise<AddTicketAttachmentResult> {
  const eventId = command.eventId?.trim() || null;
  const mediaIds = command.mediaIds.filter((id) => id.trim().length > 0);

  if (mediaIds.length === 0) {
    return { success: false, error: { code: "helpdesk.add-ticket-attachment.no_media", message: "Nenhum arquivo para anexar." } };
  }
  if (mediaIds.length > MAX_TICKET_ATTACHMENTS_PER_SCOPE) {
    return {
      success: false,
      error: { code: "helpdesk.add-ticket-attachment.too_many", message: `Anexe no máximo ${MAX_TICKET_ATTACHMENTS_PER_SCOPE} arquivos por vez.` },
    };
  }

  if (eventId && !(await eventBelongsToTicket(eventId, command.ticketId))) {
    return { success: false, error: { code: "helpdesk.add-ticket-attachment.event_mismatch", message: "Comentário não pertence a este chamado." } };
  }

  // Teto de 3 por escopo (chamado na abertura, ou um comentário) — reforçado aqui além do
  // validation.ts, contando o que já existe.
  const existing = await countAttachmentsInScope(command.ticketId, eventId);
  if (existing + mediaIds.length > MAX_TICKET_ATTACHMENTS_PER_SCOPE) {
    return {
      success: false,
      error: {
        code: "helpdesk.add-ticket-attachment.limit_reached",
        message: `Cada chamado ou comentário aceita no máximo ${MAX_TICKET_ATTACHMENTS_PER_SCOPE} anexos.`,
      },
    };
  }

  const handle = beginOperation({
    useCase: "helpdesk.add-ticket-attachment",
    actor: { id: command.uploadedByUserId, type: "user" },
    kind: "write",
  });

  const records = await insertAttachments({
    ticketId: command.ticketId,
    eventId,
    mediaIds,
    uploadedByUserId: command.uploadedByUserId,
  });

  endOperation(handle, { success: true });
  return { success: true, data: records };
}
