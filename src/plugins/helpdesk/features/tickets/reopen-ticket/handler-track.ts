import { registerKioskSubmission } from "../../../shared/kiosk-throttle";
import { isWellFormedToken } from "../../../shared/kiosk-token";
import { reopenTicket } from "./service";
import { findTicketForReopenByToken } from "./store";
import type { ReopenTrackedTicketInput, ReopenTicketResult } from "./types";

const NOT_FOUND = { code: "helpdesk.reopen-ticket.not_found", message: "Chamado não encontrado." } as const;

// Reabrir pelo link de acompanhamento anônimo (§2.5) — sem authorizeActor, o `tracking_token`
// autoriza (mesmo racional de add-tracking-comment / rate-ticket). Throttle por token com chave
// própria pra não virar botão de reabrir/fechar em loop.
export async function reopenTrackedTicketHandler(input: ReopenTrackedTicketInput): Promise<ReopenTicketResult> {
  const token = input.trackingToken.trim();
  if (!isWellFormedToken(token)) {
    return { success: false, error: NOT_FOUND };
  }
  if (input.note && input.note.trim().length > 2000) {
    return {
      success: false,
      error: { code: "helpdesk.reopen-ticket.note_too_long", message: "A observação deve ter no máximo 2000 caracteres." },
    };
  }

  const throttle = registerKioskSubmission(`track-reopen:${token}`);
  if (!throttle.allowed) {
    return {
      success: false,
      error: {
        code: "helpdesk.reopen-ticket.throttled",
        message: `Aguarde ${Math.ceil(throttle.retryAfterMs / 1000)}s antes de tentar de novo.`,
      },
    };
  }

  const ticket = await findTicketForReopenByToken(token);
  if (!ticket) {
    return { success: false, error: NOT_FOUND };
  }

  return reopenTicket({
    ticketId: ticket.id,
    queueId: ticket.queueId,
    status: ticket.status,
    resolvedAt: ticket.resolvedAt,
    note: input.note ?? null,
    actorUserId: null,
    authorLabel: ticket.requesterName ?? "Solicitante",
  });
}
