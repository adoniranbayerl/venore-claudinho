import { authorizeAnyConfigActor } from "../../../shared/scoped-authorization";
import { deleteTvBoard } from "./service";
import type { DeleteTvBoardInput, DeleteTvBoardResult } from "./types";

export async function deleteTvBoardHandler(input: DeleteTvBoardInput): Promise<DeleteTvBoardResult> {
  if (!input.boardId || input.boardId.trim().length === 0) {
    return { success: false, error: { code: "company-metrics.delete-tv-board.missing_board", message: "Painel não informado." } };
  }

  const authz = await authorizeAnyConfigActor();
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }
  return deleteTvBoard({ ...input, actorId: authz.actorId });
}
