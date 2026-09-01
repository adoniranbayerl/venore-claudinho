import { registerKioskSubmission } from "../../../shared/kiosk-throttle";
import { isWellFormedToken } from "../../../shared/kiosk-token";
import { rateTicket } from "./service";
import { findTicketForRatingByToken } from "./store";
import type { RateTicketInput, RateTicketResult } from "./types";

const NOT_FOUND = { code: "helpdesk.rate-ticket.not_found", message: "Chamado não encontrado." } as const;

// Sem authorizeActor de propósito (§2.5) — avaliação pelo tracking token. Throttle por token com
// chave própria.
export async function rateTicketHandler(input: RateTicketInput): Promise<RateTicketResult> {
  const token = input.trackingToken.trim();
  if (!isWellFormedToken(token)) {
    return { success: false, error: NOT_FOUND };
  }
  if (input.comment && input.comment.trim().length > 2000) {
    return {
      success: false,
      error: { code: "helpdesk.rate-ticket.comment_too_long", message: "A observação deve ter no máximo 2000 caracteres." },
    };
  }

  const ticket = await findTicketForRatingByToken(token);
  if (!ticket) {
    return { success: false, error: NOT_FOUND };
  }
  // Guarda de estado antes do throttle: tentar avaliar um chamado que ainda não foi resolvido não
  // deve "gastar" a janela — o service repete a checagem como defesa em profundidade.
  if (ticket.status !== "resolved" && ticket.status !== "closed") {
    return {
      success: false,
      error: {
        code: "helpdesk.rate-ticket.not_resolved",
        message: "A avaliação fica disponível quando o chamado é resolvido.",
      },
    };
  }

  const throttle = registerKioskSubmission(`track-rate:${token}`);
  if (!throttle.allowed) {
    return {
      success: false,
      error: {
        code: "helpdesk.rate-ticket.throttled",
        message: `Aguarde ${Math.ceil(throttle.retryAfterMs / 1000)}s antes de enviar outra avaliação.`,
      },
    };
  }

  return rateTicket({
    ticketId: ticket.id,
    queueId: ticket.queueId,
    status: ticket.status,
    score: input.score,
    comment: input.comment ?? null,
    authorUserId: null,
    authorLabel: ticket.requesterName ?? "Solicitante",
  });
}
