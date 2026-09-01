import { beginOperation, endOperation } from "@/observability";
import { notify } from "../../../shared/notify";
import { TICKET_RATING_MAX, TICKET_RATING_MIN, type TicketStatus } from "../../../contracts/types";
import { applyRating } from "./store";
import type { RateTicketResult } from "./types";

// O handler já resolveu o chamado (por tracking token ou por id + sessão do solicitante) e a
// autorização. Aqui: valida a nota, confere que o chamado já foi resolvido (§5 — a avaliação nasce
// com o convite de resolução; um chamado cancelado não é avaliado), grava e denormaliza.
export async function rateTicket(command: {
  ticketId: string;
  queueId: string;
  status: TicketStatus;
  score: number;
  comment: string | null;
  authorUserId: string | null;
  authorLabel: string | null;
}): Promise<RateTicketResult> {
  if (!Number.isInteger(command.score) || command.score < TICKET_RATING_MIN || command.score > TICKET_RATING_MAX) {
    return {
      success: false,
      error: {
        code: "helpdesk.rate-ticket.invalid_score",
        message: `A nota deve ser de ${TICKET_RATING_MIN} a ${TICKET_RATING_MAX}.`,
      },
    };
  }
  if (command.status !== "resolved" && command.status !== "closed") {
    return {
      success: false,
      error: {
        code: "helpdesk.rate-ticket.not_resolved",
        message: "A avaliação fica disponível quando o chamado é resolvido.",
      },
    };
  }

  const handle = beginOperation({
    useCase: "helpdesk.rate-ticket",
    actor: command.authorUserId ? { id: command.authorUserId, type: "user" } : { id: command.ticketId, type: "anonymous" },
    kind: "write",
  });

  await applyRating({
    ticketId: command.ticketId,
    score: command.score,
    comment: command.comment?.trim() || null,
    authorUserId: command.authorUserId,
    authorLabel: command.authorLabel,
  });

  // §2.3 — `rating_received` para o técnico atribuído (a fila acompanha pela aba Relatório). O
  // autor nunca se autonotifica; o assignee nunca é o solicitante, então a nota sempre chega.
  await notify({
    ticketId: command.ticketId,
    queueId: command.queueId,
    kind: "rating_received",
    text: `avaliação: ${command.score}/${TICKET_RATING_MAX}`,
    actorUserId: command.authorUserId,
    audiences: ["assignee"],
  });

  endOperation(handle, { success: true });
  return { success: true, data: { score: command.score } };
}
