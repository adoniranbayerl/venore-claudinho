import { beginOperation, endOperation } from "@/observability";
import { deleteBoardById } from "../../../shared/board-store";
import type { DeleteBoardCommand, DeleteBoardResult } from "./types";

// Apaga um painel. Só a linha de config some — o token deixa de resolver e a TV cai em notFound.
export async function deleteBoard(command: DeleteBoardCommand): Promise<DeleteBoardResult> {
  const handle = beginOperation({
    useCase: "helpdesk.delete-board",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const deleted = await deleteBoardById(command.boardId);

  endOperation(handle, { success: true });
  if (!deleted) {
    return { success: false, error: { code: "helpdesk.delete-board.not_found", message: "Painel não encontrado." } };
  }
  return { success: true, data: { id: command.boardId } };
}
