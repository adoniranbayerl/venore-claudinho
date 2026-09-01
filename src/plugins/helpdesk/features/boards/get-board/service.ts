import { isWellFormedToken } from "../../../shared/kiosk-token";
import { findBoardByToken, findQueueNameById } from "../../../shared/board-store";
import type { GetBoardResult } from "./types";

const NOT_FOUND = {
  code: "helpdesk.get-board.not_found",
  message: "Este painel não está disponível.",
} as const;

// Sem authorizeActor (§2.6, mesmo racional de get-kiosk-by-token / verify-output-pin do
// broadcast): acesso por token. Só a casca da página — rótulo, layout e intervalo de polling; os
// cards vêm de get-board-feed.
export async function getBoard(token: string): Promise<GetBoardResult> {
  if (!isWellFormedToken(token.trim())) {
    return { success: false, error: NOT_FOUND };
  }

  const board = await findBoardByToken(token.trim());
  if (!board) {
    return { success: false, error: NOT_FOUND };
  }

  return {
    success: true,
    data: {
      label: board.label,
      layout: board.layout,
      queueName: board.queueId ? await findQueueNameById(board.queueId) : null,
      showAssignee: board.showAssignee,
      refreshSeconds: board.refreshSeconds,
    },
  };
}
