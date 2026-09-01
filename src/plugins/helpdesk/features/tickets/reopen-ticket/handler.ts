import { getCurrentUser } from "@/contexts/auth";
import { reopenTicket } from "./service";
import { findTicketForReopen } from "./store";
import type { ReopenTicketInput, ReopenTicketResult } from "./types";

const NOT_FOUND = { code: "helpdesk.reopen-ticket.not_found", message: "Chamado não encontrado." } as const;

// Reabrir pelo portal logado (§3.1 — self-service, sem permission): quem reabre precisa ser o
// `requester_user_id` do chamado. A janela de N dias + a guarda de estado ficam no service.
export async function reopenTicketHandler(input: ReopenTicketInput): Promise<ReopenTicketResult> {
  if (!input.ticketId || input.ticketId.trim().length === 0) {
    return { success: false, error: { code: "helpdesk.reopen-ticket.missing_ticket", message: "Chamado não informado." } };
  }
  if (input.note && input.note.trim().length > 2000) {
    return {
      success: false,
      error: { code: "helpdesk.reopen-ticket.note_too_long", message: "A observação deve ter no máximo 2000 caracteres." },
    };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: { code: "helpdesk.reopen-ticket.unauthenticated", message: "É necessário estar autenticado." },
    };
  }
  const actorId = currentUser.data.id;

  const ticket = await findTicketForReopen(input.ticketId);
  if (!ticket) {
    return { success: false, error: NOT_FOUND };
  }
  if (ticket.requesterUserId === null || ticket.requesterUserId !== actorId) {
    return {
      success: false,
      error: { code: "helpdesk.reopen-ticket.forbidden", message: "Só quem abriu o chamado pode reabri-lo." },
    };
  }

  return reopenTicket({
    ticketId: ticket.id,
    queueId: ticket.queueId,
    status: ticket.status,
    resolvedAt: ticket.resolvedAt,
    note: input.note ?? null,
    actorUserId: actorId,
    authorLabel: null,
  });
}
