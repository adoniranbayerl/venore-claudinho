import { authorizeActor } from "@/contexts/rbac";
import { deleteBoard } from "./service";
import type { DeleteBoardInput, DeleteBoardResult } from "./types";

export async function deleteBoardHandler(input: DeleteBoardInput): Promise<DeleteBoardResult> {
  if (!input.boardId || input.boardId.trim().length === 0) {
    return { success: false, error: { code: "helpdesk.delete-board.missing_board", message: "Painel não informado." } };
  }

  const authz = await authorizeActor("helpdesk.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return deleteBoard({ boardId: input.boardId, actorId: authz.actorId });
}
