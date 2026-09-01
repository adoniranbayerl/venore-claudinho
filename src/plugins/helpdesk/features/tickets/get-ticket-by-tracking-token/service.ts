import { isWellFormedToken } from "../../../shared/kiosk-token";
import { formatTicketReference } from "../../../shared/ticket-reference";
import { TICKET_FINAL_STATUSES, type TicketTimelineEntry } from "../../../contracts/types";
import { findPublicEventsByTicket, findTrackedTicketByToken } from "./store";
import type { GetTicketByTrackingTokenResult } from "./types";

const NOT_FOUND = {
  code: "helpdesk.get-ticket-by-tracking-token.not_found",
  message: "Chamado não encontrado.",
} as const;

// Sem authorizeActor (§2.5) — acesso pelo `tracking_token` que a pessoa guardou. Devolve só o
// necessário para acompanhar: timeline pública (nada `internal`), sem UUIDs de usuário.
export async function getTicketByTrackingToken(trackingToken: string): Promise<GetTicketByTrackingTokenResult> {
  const token = trackingToken.trim();
  if (!isWellFormedToken(token)) {
    return { success: false, error: NOT_FOUND };
  }

  const ticket = await findTrackedTicketByToken(token);
  if (!ticket) {
    return { success: false, error: NOT_FOUND };
  }

  const events = await findPublicEventsByTicket(ticket.id);

  const timeline: TicketTimelineEntry[] = events.map((event) => ({
    id: event.id,
    kind: event.kind,
    // Anônimo: não expõe o id interno de quem agiu — só o rótulo ("Sistema", "Equipe de
    // atendimento" é resolvido no componente quando authorLabel é null).
    authorUserId: null,
    authorLabel: event.authorLabel,
    visibility: event.visibility,
    body: event.body,
    meta: event.meta,
    createdAt: event.createdAt,
    attachments: [],
  }));

  const lastRating = [...events].reverse().find((event) => event.kind === "rating");

  const isFinalOrResolved =
    ticket.status === "resolved" || (TICKET_FINAL_STATUSES as readonly string[]).includes(ticket.status);

  return {
    success: true,
    data: {
      reference: formatTicketReference({ queueKey: ticket.queueKey, seq: ticket.seq }),
      queueName: ticket.queueName,
      categoryLabel: ticket.categoryLabel,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      location: ticket.location,
      requesterName: ticket.requesterName,
      createdAt: ticket.createdAt,
      resolvedAt: ticket.resolvedAt,
      timeline,
      canRate: isFinalOrResolved && ticket.status !== "cancelled",
      ratingScore: lastRating?.meta?.score ?? null,
    },
  };
}
