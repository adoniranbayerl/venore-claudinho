import { beginOperation, endOperation } from "@/observability";
import { findKioskById, isQueueActive, updateKioskFields } from "../../../shared/kiosk-store";
import type { UpdateKioskCommand, UpdateKioskResult } from "./types";

// Edita rótulo, fila fixada, local padrão e o liga/desliga. O `token` nunca muda (está impresso em
// QR já colado na parede). Desligar (`active = false`) não apaga os chamados que o quiosque
// originou — a FK em `tickets.origin_kiosk_id` é `set null`.
export async function updateKiosk(command: UpdateKioskCommand): Promise<UpdateKioskResult> {
  const existing = await findKioskById(command.kioskId);
  if (!existing) {
    return { success: false, error: { code: "helpdesk.update-kiosk.not_found", message: "Quiosque não encontrado." } };
  }

  const queueId = command.queueId?.trim() || null;
  if (queueId && !(await isQueueActive(queueId))) {
    return {
      success: false,
      error: { code: "helpdesk.update-kiosk.queue_not_found", message: "Fila não encontrada ou arquivada." },
    };
  }

  const handle = beginOperation({
    useCase: "helpdesk.update-kiosk",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const record = await updateKioskFields(command.kioskId, {
    label: command.label.trim(),
    queueId,
    defaultLocation: command.defaultLocation?.trim() || null,
    active: command.active,
  });

  endOperation(handle, { success: true });
  if (!record) {
    return { success: false, error: { code: "helpdesk.update-kiosk.not_found", message: "Quiosque não encontrado." } };
  }
  return { success: true, data: record };
}
