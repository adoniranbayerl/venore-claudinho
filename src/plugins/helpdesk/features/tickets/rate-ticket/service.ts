import { beginOperation, endOperation } from "@/observability";
import { notify } from "../../../shared/notify";
import { TICKET_RATING_MAX, TICKET_RATING_MIN } from "../../../contracts/types";
import { findTicketForRatingByToken, insertRatingEvent } from "./store";
import type { RateTicketResult } from "./types";

// Sem authorizeActor (§2.5) — avaliação pelo link de acompanhamento. Só depois de resolvido
// (§5, "resolved → notifica o solicitante + convite de avaliação"); um chamado cancelado não é
// avaliado.
export async function rateTicket(command: {
  trackingToken: string;
  score: number;
  comment: string | null;
}): Promise<RateTicketResult> {
  if (!Number.isInteger(command.score) || command.score < TICKET_RATING_MIN || command.score > TICKET_RATING_MAX) {
    return {
      success: false,
      error: { code: "helpdesk.rate-ticket.invalid_score", message: `A nota deve ser de ${TICKET_RATING_MIN} a ${TICKET_RATING_MAX}.` },
    };
  }

  const ticket = await findTicketForRatingByToken(command.trackingToken);
  if (!ticket) {
    return { success: false, error: { code: "helpdesk.rate-ticket.not_found", message: "Chamado não encontrado." } };
  }
  if (ticket.status !== "resolved" && ticket.status !== "closed") {
    return {
      success: false,
      error: { code: "helpdesk.rate-ticket.not_resolved", message: "A avaliação fica disponível quando o chamado é resolvido." },
    };
  }

  const handle = beginOperation({
    useCase: "helpdesk.rate-ticket",
    actor: { id: ticket.id, type: "anonymous" },
    kind: "write",
  });

  await insertRatingEvent({
    ticketId: ticket.id,
    score: command.score,
    comment: command.comment?.trim() || null,
    authorLabel: ticket.requesterName ?? "Solicitante",
  });

  // §2.3 — `rating_received` para o técnico atribuído (a fila acompanha pelo relatório na Fase 7).
  await notify({
    ticketId: ticket.id,
    queueId: ticket.queueId,
    kind: "rating_received",
    text: `avaliação: ${command.score}/${TICKET_RATING_MAX}`,
    actorUserId: null,
    audiences: ["assignee"],
  });

  endOperation(handle, { success: true });
  return { success: true, data: { score: command.score } };
}
