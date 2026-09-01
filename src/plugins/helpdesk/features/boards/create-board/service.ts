import { beginOperation, endOperation } from "@/observability";
import { isQueueActive } from "../../../shared/kiosk-store";
import { generateBoardToken } from "../../../shared/kiosk-token";
import { insertBoard } from "../../../shared/board-store";
import type { CreateBoardCommand, CreateBoardResult } from "./types";

// Cria um painel com token novo (hex aleatório, vai na URL /chamados/painel/[token]). `queueId`
// null = painel de todas as filas; quando informado, a fila precisa existir e não estar arquivada.
export async function createBoard(command: CreateBoardCommand): Promise<CreateBoardResult> {
  const queueId = command.queueId?.trim() || null;
  if (queueId && !(await isQueueActive(queueId))) {
    return {
      success: false,
      error: { code: "helpdesk.create-board.queue_not_found", message: "Fila não encontrada ou arquivada." },
    };
  }

  const handle = beginOperation({
    useCase: "helpdesk.create-board",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const record = await insertBoard({
    token: generateBoardToken(),
    label: command.label.trim(),
    queueId,
    layout: command.layout,
    showAssignee: command.showAssignee,
    refreshSeconds: command.refreshSeconds,
  });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
