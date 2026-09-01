import { isWellFormedToken } from "../../../shared/kiosk-token";
import { findKioskByToken, listActiveQueueOptions } from "../../../shared/kiosk-store";
import type { GetKioskByTokenResult } from "./types";

const NOT_FOUND = {
  code: "helpdesk.get-kiosk-by-token.not_found",
  message: "Este quiosque não está disponível.",
} as const;

// Sem authorizeActor (§2.5, mesmo racional de verify-output-pin do broadcast): acesso por token.
// Só devolve dado de um quiosque ATIVO — token inválido, inexistente ou desligado responde a
// mesma coisa (não vaza a diferença).
export async function getKioskByToken(token: string): Promise<GetKioskByTokenResult> {
  if (!isWellFormedToken(token)) {
    return { success: false, error: NOT_FOUND };
  }

  const kiosk = await findKioskByToken(token);
  if (!kiosk || !kiosk.active) {
    return { success: false, error: NOT_FOUND };
  }

  let fixedQueue: { id: string; name: string } | null = null;
  let queues: { id: string; name: string }[] = [];

  if (kiosk.queueId) {
    const options = await listActiveQueueOptions();
    const match = options.find((queue) => queue.id === kiosk.queueId);
    // Fila fixada foi arquivada depois — cai no modo "escolha uma fila" em vez de travar o QR.
    if (match) {
      fixedQueue = match;
    } else {
      queues = options;
    }
  } else {
    queues = await listActiveQueueOptions();
  }

  if (!fixedQueue && queues.length === 0) {
    return {
      success: false,
      error: {
        code: "helpdesk.get-kiosk-by-token.no_queue",
        message: "Nenhuma fila de atendimento está disponível no momento.",
      },
    };
  }

  return {
    success: true,
    data: {
      token: kiosk.token,
      label: kiosk.label,
      fixedQueue,
      defaultLocation: kiosk.defaultLocation,
      queues,
    },
  };
}
