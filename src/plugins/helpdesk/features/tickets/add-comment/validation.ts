import { TICKET_EVENT_VISIBILITIES } from "../../../contracts/types";
import type { HelpdeskValidationError } from "../../../shared/validation-error";
import type { AddCommentInput } from "./types";

export function validateAddCommentInput(input: AddCommentInput): HelpdeskValidationError | null {
  if (!input.ticketId || input.ticketId.trim().length === 0) {
    return { code: "helpdesk.add-comment.missing_ticket", message: "Chamado não informado." };
  }
  if (input.body.trim().length === 0) {
    return { code: "helpdesk.add-comment.empty", message: "O comentário não pode ser vazio." };
  }
  if (input.body.trim().length > 5000) {
    return { code: "helpdesk.add-comment.too_long", message: "O comentário deve ter no máximo 5000 caracteres." };
  }
  if (input.visibility && !TICKET_EVENT_VISIBILITIES.includes(input.visibility)) {
    return { code: "helpdesk.add-comment.invalid_visibility", message: "Visibilidade de comentário inválida." };
  }
  return null;
}
