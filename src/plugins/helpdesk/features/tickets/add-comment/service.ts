import { beginOperation, endOperation } from "@/observability";
import { findTicketAuthzInfo } from "../../../shared/scoped-authorization";
import { notify } from "../../../shared/notify";
import { insertComment } from "./store";
import type { AddCommentCommand, AddCommentResult } from "./types";

export async function addComment(command: AddCommentCommand): Promise<AddCommentResult> {
  const ticket = await findTicketAuthzInfo(command.ticketId);
  if (!ticket) {
    return { success: false, error: { code: "helpdesk.add-comment.ticket_not_found", message: "Chamado não encontrado." } };
  }

  // Só a equipe grava nota `internal`; o solicitante só comenta `public`.
  const visibility = command.visibility === "internal" && command.isTeamMember ? "internal" : "public";

  if (ticket.status === "closed" || ticket.status === "cancelled") {
    return { success: false, error: { code: "helpdesk.add-comment.ticket_closed", message: "Este chamado está encerrado." } };
  }

  const isRequester = ticket.requesterUserId !== null && ticket.requesterUserId === command.authorUserId;
  const returnWaitingToInProgress = isRequester && visibility === "public" && ticket.status === "waiting";

  const handle = beginOperation({
    useCase: "helpdesk.add-comment",
    actor: { id: command.authorUserId, type: "user" },
    kind: "write",
  });

  // §2.4 — o primeiro comentário PÚBLICO de um agente conta como "primeira resposta".
  const markFirstResponse = visibility === "public" && command.isTeamMember;

  const result = await insertComment({
    ticketId: command.ticketId,
    body: command.body.trim(),
    visibility,
    authorUserId: command.authorUserId,
    returnWaitingToInProgress,
    markFirstResponse,
  });

  // §2.3 — `comment_added` para a equipe da fila + o técnico atribuído; o solicitante só é
  // avisado de comentário PÚBLICO (nota `internal` fica só na equipe). O autor nunca se
  // autonotifica (resolveNotificationRecipients exclui).
  await notify({
    ticketId: command.ticketId,
    queueId: ticket.queueId,
    kind: "comment_added",
    text: visibility === "public" ? "novo comentário" : "nova nota interna",
    actorUserId: command.authorUserId,
    audiences: visibility === "public" ? ["queue", "assignee", "requester"] : ["queue", "assignee"],
  });

  endOperation(handle, { success: true });
  return { success: true, data: result };
}
