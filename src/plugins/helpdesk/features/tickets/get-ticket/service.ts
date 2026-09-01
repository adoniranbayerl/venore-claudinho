import { resolveAttachmentViews } from "../../../shared/ticket-attachments";
import {
  findAttachmentsByTicket,
  findCategoryBasics,
  findEventsByTicket,
  findQueueBasics,
} from "./store";
import { buildTicketDetail } from "./view";
import type { GetTicketResult } from "./types";
import type { TicketRecord } from "../../../contracts/types";

// O acesso já foi checado no handler (solicitante do próprio chamado, ou resolveTicketViewActor).
// `canSeeInternal` decide se as notas `internal` entram na timeline.
export async function assembleTicketDetail(ticket: TicketRecord, canSeeInternal: boolean): Promise<GetTicketResult> {
  const queue = await findQueueBasics(ticket.queueId);
  if (!queue) {
    return { success: false, error: { code: "helpdesk.get-ticket.queue_missing", message: "A fila do chamado não existe mais." } };
  }

  const [category, events, attachmentRecords] = await Promise.all([
    ticket.categoryId ? findCategoryBasics(ticket.categoryId) : Promise.resolve(null),
    findEventsByTicket(ticket.id),
    findAttachmentsByTicket(ticket.id),
  ]);

  const attachments = await resolveAttachmentViews(attachmentRecords);

  return {
    success: true,
    data: buildTicketDetail({ ticket, queue, category, events, attachments, canSeeInternal }),
  };
}
