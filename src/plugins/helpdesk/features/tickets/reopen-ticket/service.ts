import { beginOperation, endOperation } from "@/observability";
import { canRequesterReopen, TICKET_REOPEN_WINDOW_DAYS } from "../../../shared/ticket-state";
import { notify } from "../../../shared/notify";
import { applyReopen } from "./store";
import type { ReopenTicketResult } from "./types";
import type { TicketStatus } from "../../../contracts/types";

// Guarda de "só requester + janela de N dias" (§5). O handler já confirmou que quem pede É o
// solicitante (sessão ou token); aqui só cuida do estado e do prazo. Um chamado que não está
// `resolved`, ou já passou da janela, não reabre — a mensagem sugere abrir um novo.
export async function reopenTicket(command: {
  ticketId: string;
  queueId: string;
  status: TicketStatus;
  resolvedAt: Date | null;
  note: string | null;
  actorUserId: string | null;
  authorLabel: string | null;
}): Promise<ReopenTicketResult> {
  if (!canRequesterReopen(command.status, command.resolvedAt)) {
    if (command.status !== "resolved") {
      return {
        success: false,
        error: {
          code: "helpdesk.reopen-ticket.not_reopenable",
          message: "Só um chamado resolvido pode ser reaberto. Se o problema voltou, abra um novo chamado.",
        },
      };
    }
    return {
      success: false,
      error: {
        code: "helpdesk.reopen-ticket.window_expired",
        message: `O prazo de ${TICKET_REOPEN_WINDOW_DAYS} dias para reabrir este chamado já passou. Abra um novo chamado.`,
      },
    };
  }

  const handle = beginOperation({
    useCase: "helpdesk.reopen-ticket",
    actor: command.actorUserId ? { id: command.actorUserId, type: "user" } : { id: command.ticketId, type: "anonymous" },
    kind: "write",
  });

  const ticket = await applyReopen({
    ticketId: command.ticketId,
    from: command.status,
    authorUserId: command.actorUserId,
    authorLabel: command.authorLabel,
    note: command.note?.trim() || null,
  });

  // §2.3 — `reopened` para o técnico atribuído + a fila. O solicitante é o autor (nunca se
  // autonotifica); no caminho anônimo `actorUserId` é null e ninguém é excluído.
  await notify({
    ticketId: command.ticketId,
    queueId: command.queueId,
    kind: "reopened",
    text: "chamado reaberto pelo solicitante",
    actorUserId: command.actorUserId,
    audiences: ["assignee", "queue"],
  });

  endOperation(handle, { success: true });
  return { success: true, data: ticket };
}
