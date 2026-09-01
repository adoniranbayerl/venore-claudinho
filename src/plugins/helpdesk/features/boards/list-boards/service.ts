import { listActiveQueueOptions } from "../../../shared/kiosk-store";
import { listBoards } from "../../../shared/board-store";
import type { ListBoardsResult } from "./types";

export async function listBoardsForAdmin(): Promise<ListBoardsResult> {
  const [boards, queueOptions] = await Promise.all([listBoards(), listActiveQueueOptions()]);
  const queueNameById = new Map(queueOptions.map((queue) => [queue.id, queue.name]));

  return {
    success: true,
    data: {
      boards: boards.map((board) => ({
        ...board,
        queueName: board.queueId ? queueNameById.get(board.queueId) ?? null : null,
      })),
      queueOptions,
    },
  };
}
