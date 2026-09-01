import { getCurrentUser } from "@/contexts/auth";
import { findTicketAuthzInfo, resolveTicketWorkActor } from "../../../shared/scoped-authorization";
import { addTicketAttachment } from "./service";
import { validateAddTicketAttachmentInput } from "./validation";
import type { AddTicketAttachmentInput, AddTicketAttachmentResult } from "./types";

// Anexar: o solicitante anexa ao próprio chamado sem permission; a equipe anexa via
// resolveTicketWorkActor. Os bytes já passaram por @/contexts/media
// uploadTicketAttachmentMediaAsset (ator autenticado, categoria reservada, limite de tamanho).
export async function addTicketAttachmentHandler(input: AddTicketAttachmentInput): Promise<AddTicketAttachmentResult> {
  const validationError = validateAddTicketAttachmentInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return { success: false, error: { code: "helpdesk.add-ticket-attachment.unauthenticated", message: "É necessário estar autenticado para anexar." } };
  }
  const actorId = currentUser.data.id;

  const ticket = await findTicketAuthzInfo(input.ticketId);
  if (!ticket) {
    return { success: false, error: { code: "helpdesk.add-ticket-attachment.ticket_not_found", message: "Chamado não encontrado." } };
  }

  const isRequester = ticket.requesterUserId !== null && ticket.requesterUserId === actorId;
  if (!isRequester) {
    const work = await resolveTicketWorkActor(input.ticketId);
    if (!work.authorized) {
      return { success: false, error: work.error };
    }
  }

  return addTicketAttachment({ ...input, uploadedByUserId: actorId });
}
