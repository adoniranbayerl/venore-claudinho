import { resolveAttachmentViews } from "../../../shared/ticket-attachments";
import { findAttachmentRecords } from "./store";
import type { ListTicketAttachmentsResult } from "./types";

// O acesso ao chamado já foi checado no handler (solicitante do próprio, ou resolveTicketViewActor).
export async function listTicketAttachments(ticketId: string): Promise<ListTicketAttachmentsResult> {
  const records = await findAttachmentRecords(ticketId);
  return { success: true, data: await resolveAttachmentViews(records) };
}
