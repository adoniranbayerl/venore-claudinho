import { beginOperation, endOperation } from "@/observability";
import { isQueueActive } from "../../../shared/kiosk-store";
import { findBoardById, updateBoardFields } from "../../../shared/board-store";
import type { UpdateBoardCommand, UpdateBoardResult } from "./types";

// Edita rótulo, fila, layout, exibição do responsável e o intervalo de atualização. O `token`
// nunca muda — a TV já está apontada para a URL (pode até estar numa playlist do broadcast).
export async function updateBoard(command: UpdateBoardCommand): Promise<UpdateBoardResult> {
  const existing = await findBoardById(command.boardId);
  if (!existing) {
    return { success: false, error: { code: "helpdesk.update-board.not_found", message: "Painel não encontrado." } };
  }

  const queueId = command.queueId?.trim() || null;
  if (queueId && !(await isQueueActive(queueId))) {
    return {
      success: false,
      error: { code: "helpdesk.update-board.queue_not_found", message: "Fila não encontrada ou arquivada." },
    };
  }

  const handle = beginOperation({
    useCase: "helpdesk.update-board",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const record = await updateBoardFields(command.boardId, {
    label: command.label.trim(),
    queueId,
    layout: command.layout,
    showAssignee: command.showAssignee,
    refreshSeconds: command.refreshSeconds,
  });

  endOperation(handle, { success: true });
  if (!record) {
    return { success: false, error: { code: "helpdesk.update-board.not_found", message: "Painel não encontrado." } };
  }
  return { success: true, data: record };
}
