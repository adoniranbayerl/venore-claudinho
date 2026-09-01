import { getCurrentUser } from "@/contexts/auth";
import { findTicketAuthzInfo, resolveTicketViewActor } from "../../../shared/scoped-authorization";
import { listTicketAttachments } from "./service";
import type { ListTicketAttachmentsResult } from "./types";

export async function listTicketAttachmentsHandler(input: { ticketId: string }): Promise<ListTicketAttachmentsResult> {
  if (!input.ticketId || input.ticketId.trim().length === 0) {
    return { success: false, error: { code: "helpdesk.list-ticket-attachments.missing_ticket", message: "Chamado não informado." } };
  }

  const ticket = await findTicketAuthzInfo(input.ticketId);
  if (!ticket) {
    return { success: false, error: { code: "helpdesk.list-ticket-attachments.not_found", message: "Chamado não encontrado." } };
  }

  const currentUser = await getCurrentUser();
  const actorId = currentUser.success ? currentUser.data?.id ?? null : null;

  if (!(actorId && ticket.requesterUserId === actorId)) {
    const view = await resolveTicketViewActor(input.ticketId);
    if (!view.authorized) {
      return { success: false, error: view.error };
    }
  }

  return listTicketAttachments(input.ticketId);
}
