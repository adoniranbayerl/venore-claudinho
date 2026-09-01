import { registerKioskSubmission } from "../../../shared/kiosk-throttle";
import { isWellFormedToken } from "../../../shared/kiosk-token";
import { addTrackingComment } from "./service";
import type { AddTrackingCommentInput, AddTrackingCommentResult } from "./types";

const NOT_FOUND = {
  code: "helpdesk.add-tracking-comment.not_found",
  message: "Chamado não encontrado.",
} as const;

// Sem authorizeActor de propósito (§2.5) — acesso pelo tracking token. Throttle ingênuo por token
// (chave própria, separada do envio do quiosque e da avaliação, pra uma ação não bloquear a
// outra).
export async function addTrackingCommentHandler(input: AddTrackingCommentInput): Promise<AddTrackingCommentResult> {
  const token = input.trackingToken.trim();
  if (!isWellFormedToken(token)) {
    return { success: false, error: NOT_FOUND };
  }
  if (input.body.trim().length === 0) {
    return { success: false, error: { code: "helpdesk.add-tracking-comment.empty", message: "O comentário não pode ser vazio." } };
  }
  if (input.body.trim().length > 3000) {
    return { success: false, error: { code: "helpdesk.add-tracking-comment.too_long", message: "O comentário deve ter no máximo 3000 caracteres." } };
  }

  const throttle = registerKioskSubmission(`track-comment:${token}`);
  if (!throttle.allowed) {
    return {
      success: false,
      error: {
        code: "helpdesk.add-tracking-comment.throttled",
        message: `Aguarde ${Math.ceil(throttle.retryAfterMs / 1000)}s antes de comentar de novo.`,
      },
    };
  }

  return addTrackingComment({ trackingToken: token, body: input.body });
}
