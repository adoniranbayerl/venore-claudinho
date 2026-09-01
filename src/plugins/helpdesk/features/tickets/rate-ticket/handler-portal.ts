import { getCurrentUser } from "@/contexts/auth";
import { rateTicket } from "./service";
import { findTicketForRating } from "./store";
import type { RateOwnTicketInput, RateTicketResult } from "./types";

const NOT_FOUND = { code: "helpdesk.rate-ticket.not_found", message: "Chamado não encontrado." } as const;

// Avaliar pelo portal logado (§3.1 — self-service, sem permission): quem avalia precisa ser o
// `requester_user_id` do chamado. `rating-prompt` chama isto quando o chamado está `resolved`.
export async function rateOwnTicketHandler(input: RateOwnTicketInput): Promise<RateTicketResult> {
  if (!input.ticketId || input.ticketId.trim().length === 0) {
    return { success: false, error: { code: "helpdesk.rate-ticket.missing_ticket", message: "Chamado não informado." } };
  }
  if (input.comment && input.comment.trim().length > 2000) {
    return {
      success: false,
      error: { code: "helpdesk.rate-ticket.comment_too_long", message: "A observação deve ter no máximo 2000 caracteres." },
    };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: { code: "helpdesk.rate-ticket.unauthenticated", message: "É necessário estar autenticado." },
    };
  }
  const actorId = currentUser.data.id;

  const ticket = await findTicketForRating(input.ticketId);
  if (!ticket) {
    return { success: false, error: NOT_FOUND };
  }
  if (ticket.requesterUserId === null || ticket.requesterUserId !== actorId) {
    return {
      success: false,
      error: { code: "helpdesk.rate-ticket.forbidden", message: "Só quem abriu o chamado pode avaliá-lo." },
    };
  }

  return rateTicket({
    ticketId: ticket.id,
    queueId: ticket.queueId,
    status: ticket.status,
    score: input.score,
    comment: input.comment ?? null,
    authorUserId: actorId,
    authorLabel: null,
  });
}
