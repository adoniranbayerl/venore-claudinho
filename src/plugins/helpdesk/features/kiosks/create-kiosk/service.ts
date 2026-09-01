import { beginOperation, endOperation } from "@/observability";
import { generateKioskToken } from "../../../shared/kiosk-token";
import { insertKiosk, isQueueActive } from "../../../shared/kiosk-store";
import type { CreateKioskCommand, CreateKioskResult } from "./types";

// Cria um quiosque com token novo (hex aleatório, vai no QR). Fila fixada é opcional; quando
// informada, precisa existir e não estar arquivada.
export async function createKiosk(command: CreateKioskCommand): Promise<CreateKioskResult> {
  const queueId = command.queueId?.trim() || null;
  if (queueId && !(await isQueueActive(queueId))) {
    return {
      success: false,
      error: { code: "helpdesk.create-kiosk.queue_not_found", message: "Fila não encontrada ou arquivada." },
    };
  }

  const handle = beginOperation({
    useCase: "helpdesk.create-kiosk",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const record = await insertKiosk({
    token: generateKioskToken(),
    label: command.label.trim(),
    queueId,
    defaultLocation: command.defaultLocation?.trim() || null,
    active: true,
  });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
