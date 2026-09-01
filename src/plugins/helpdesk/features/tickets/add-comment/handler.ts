import { getCurrentUser } from "@/contexts/auth";
import { findTicketAuthzInfo, resolveTicketWorkActor } from "../../../shared/scoped-authorization";
import { addComment } from "./service";
import { validateAddCommentInput } from "./validation";
import type { AddCommentInput, AddCommentResult } from "./types";

// Comentar: o solicitante comenta o próprio chamado sem permission (só `public`); a equipe comenta
// via resolveTicketWorkActor e pode marcar `internal`.
export async function addCommentHandler(input: AddCommentInput): Promise<AddCommentResult> {
  const validationError = validateAddCommentInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return { success: false, error: { code: "helpdesk.add-comment.unauthenticated", message: "É necessário estar autenticado para comentar." } };
  }
  const actorId = currentUser.data.id;

  const ticket = await findTicketAuthzInfo(input.ticketId);
  if (!ticket) {
    return { success: false, error: { code: "helpdesk.add-comment.ticket_not_found", message: "Chamado não encontrado." } };
  }

  const isRequester = ticket.requesterUserId !== null && ticket.requesterUserId === actorId;

  let isTeamMember = false;
  if (!isRequester) {
    const work = await resolveTicketWorkActor(input.ticketId);
    if (!work.authorized) {
      return { success: false, error: work.error };
    }
    isTeamMember = true;
  }

  return addComment({
    ticketId: input.ticketId,
    body: input.body,
    visibility: input.visibility ?? "public",
    authorUserId: actorId,
    isTeamMember,
  });
}
