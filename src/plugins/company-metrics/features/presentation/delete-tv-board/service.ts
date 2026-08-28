import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { beginOperation, endOperation } from "@/observability";
import { tvBoards } from "../../../database/schema";
import { findBoardById } from "../shared/store";
import type { DeleteTvBoardCommand, DeleteTvBoardResult } from "./types";

export async function deleteTvBoard(command: DeleteTvBoardCommand): Promise<DeleteTvBoardResult> {
  const existing = await findBoardById(command.boardId);
  if (!existing) {
    return { success: false, error: { code: "company-metrics.delete-tv-board.not_found", message: "Painel não encontrado." } };
  }

  const handle = beginOperation({
    useCase: "company-metrics.delete-tv-board",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  await db.delete(tvBoards).where(eq(tvBoards.id, command.boardId));

  endOperation(handle, { success: true });
  return { success: true, data: { boardId: command.boardId } };
}
