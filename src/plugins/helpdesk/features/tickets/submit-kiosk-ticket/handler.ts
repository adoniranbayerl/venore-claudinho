import { findKioskByToken } from "../../../shared/kiosk-store";
import { registerKioskSubmission } from "../../../shared/kiosk-throttle";
import { isWellFormedToken } from "../../../shared/kiosk-token";
import { submitKioskTicket } from "./service";
import { validateSubmitKioskTicketInput } from "./validation";
import type { SubmitKioskTicketInput, SubmitKioskTicketResult } from "./types";

const KIOSK_UNAVAILABLE = {
  code: "helpdesk.submit-kiosk-ticket.kiosk_unavailable",
  message: "Este quiosque não está disponível.",
} as const;

// Sem authorizeActor de propósito (§2.5, padrão verify-output-pin do broadcast): quem substitui a
// sessão aqui é o token do quiosque + o throttle ingênuo por token (AGENTS.md §7). O handler
// resolve/valida o quiosque e a fila; o service abre o chamado.
export async function submitKioskTicketHandler(input: SubmitKioskTicketInput): Promise<SubmitKioskTicketResult> {
  const validationError = validateSubmitKioskTicketInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const token = input.token.trim();
  if (!isWellFormedToken(token)) {
    return { success: false, error: KIOSK_UNAVAILABLE };
  }

  const kiosk = await findKioskByToken(token);
  if (!kiosk || !kiosk.active) {
    return { success: false, error: KIOSK_UNAVAILABLE };
  }

  const throttle = registerKioskSubmission(token);
  if (!throttle.allowed) {
    return {
      success: false,
      error: {
        code: "helpdesk.submit-kiosk-ticket.throttled",
        message: `Aguarde ${Math.ceil(throttle.retryAfterMs / 1000)}s antes de enviar outro chamado por este quiosque.`,
      },
    };
  }

  // Fila: fixada pelo quiosque, senão a escolhida no formulário. A validação de "ativa" fica no
  // service (regra de negócio).
  const queueId = kiosk.queueId ?? input.queueId?.trim() ?? "";
  if (queueId.length === 0) {
    return {
      success: false,
      error: { code: "helpdesk.submit-kiosk-ticket.missing_queue", message: "Escolha para qual equipe é o chamado." },
    };
  }

  return submitKioskTicket({
    kioskId: kiosk.id,
    queueId,
    description: input.description,
    location: input.location ?? null,
    requesterName: input.requesterName ?? null,
    requesterContact: input.contact ?? null,
  });
}
