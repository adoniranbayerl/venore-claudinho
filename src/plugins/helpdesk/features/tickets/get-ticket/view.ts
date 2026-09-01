import { formatTicketReference } from "../../../shared/ticket-reference";
import { slaState } from "../../../shared/sla";
import type {
  TicketAttachmentView,
  TicketDetail,
  TicketEventRecord,
  TicketRecord,
} from "../../../contracts/types";

// Monta o TicketDetail: filtra eventos `internal` quando quem pediu é o solicitante
// (canSeeInternal=false) e agrupa os anexos por evento.
export function buildTicketDetail(params: {
  ticket: TicketRecord;
  queue: { id: string; key: string; name: string };
  category: { id: string; label: string } | null;
  events: TicketEventRecord[];
  attachments: TicketAttachmentView[];
  canSeeInternal: boolean;
}): TicketDetail {
  const visibleEvents = params.canSeeInternal
    ? params.events
    : params.events.filter((event) => event.visibility === "public");

  const attachmentsByEvent = new Map<string, TicketAttachmentView[]>();
  for (const attachment of params.attachments) {
    if (!attachment.eventId) continue;
    const list = attachmentsByEvent.get(attachment.eventId) ?? [];
    list.push(attachment);
    attachmentsByEvent.set(attachment.eventId, list);
  }

  const visibleAttachmentIds = new Set(
    visibleEvents.flatMap((event) => (attachmentsByEvent.get(event.id) ?? []).map((a) => a.id)),
  );

  return {
    ticket: params.ticket,
    reference: formatTicketReference({ queueKey: params.queue.key, seq: params.ticket.seq }),
    queue: params.queue,
    category: params.category,
    timeline: visibleEvents.map((event) => ({
      id: event.id,
      kind: event.kind,
      authorUserId: event.authorUserId,
      authorLabel: event.authorLabel,
      visibility: event.visibility,
      body: event.body,
      meta: event.meta,
      createdAt: event.createdAt,
      attachments: attachmentsByEvent.get(event.id) ?? [],
    })),
    // Anexos sem evento (raro — anexo solto no chamado) sempre aparecem; os presos a um evento só
    // se o evento é visível pra quem pediu.
    attachments: params.attachments.filter((a) => !a.eventId || visibleAttachmentIds.has(a.id)),
    canSeeInternal: params.canSeeInternal,
    slaState: slaState({
      slaDueAt: params.ticket.slaDueAt,
      resolvedAt: params.ticket.resolvedAt,
      createdAt: params.ticket.createdAt,
    }),
  };
}
