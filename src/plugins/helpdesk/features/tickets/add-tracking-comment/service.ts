import { beginOperation, endOperation } from "@/observability";
import { notify } from "../../../shared/notify";
import { findTicketForTrackingComment, insertTrackingComment } from "./store";
import type { AddTrackingCommentResult } from "./types";

const CLOSED = {
  code: "helpdesk.add-tracking-comment.ticket_closed",
  message: "Este chamado já foi encerrado.",
} as const;

// Sem authorizeActor (§2.5) — o handler já validou o formato do token e aplicou o throttle. O
// solicitante anônimo comenta (sempre `public`) pelo link de acompanhamento.
export async function addTrackingComment(command: {
  trackingToken: string;
  body: string;
}): Promise<AddTrackingCommentResult> {
  const ticket = await findTicketForTrackingComment(command.trackingToken);
  if (!ticket) {
    return { success: false, error: { code: "helpdesk.add-tracking-comment.not_found", message: "Chamado não encontrado." } };
  }
  if (ticket.status === "closed" || ticket.status === "cancelled") {
    return { success: false, error: CLOSED };
  }

  const handle = beginOperation({
    useCase: "helpdesk.add-tracking-comment",
    actor: { id: ticket.id, type: "anonymous" },
    kind: "write",
  });

  const result = await insertTrackingComment({
    ticketId: ticket.id,
    body: command.body.trim(),
    authorLabel: ticket.requesterName ?? "Solicitante",
    returnWaitingToInProgress: ticket.status === "waiting",
  });

  // §2.3 — comentário público avisa a fila + o técnico atribuído. O autor é anônimo (actorUserId
  // null → ninguém é excluído).
  await notify({
    ticketId: ticket.id,
    queueId: ticket.queueId,
    kind: "comment_added",
    text: "resposta do solicitante",
    actorUserId: null,
    audiences: ["queue", "assignee"],
  });

  endOperation(handle, { success: true });
  return { success: true, data: { statusChangedTo: result.statusChangedTo } };
}
