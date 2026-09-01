import { listUsers } from "@/contexts/auth";
import { isWellFormedToken } from "../../../shared/kiosk-token";
import { findBoardByToken, findQueueNameById } from "../../../shared/board-store";
import { findTicketListItems } from "../../../shared/ticket-list-store";
import { buildBoardFeed } from "../../../shared/board-feed";
import type { TicketStatus } from "../../../contracts/types";
import type { GetBoardFeedResult } from "./types";

const NOT_FOUND = {
  code: "helpdesk.get-board-feed.not_found",
  message: "Este painel não está disponível.",
} as const;

// Chamados que o painel mostra — nunca `closed`/`cancelled`. `resolved` entra para a coluna
// "Resolvido" do kanban; o `open_list` filtra para só os pendentes em shared/board-feed.ts.
const BOARD_STATUSES: TicketStatus[] = ["open", "in_progress", "waiting", "resolved"];

// Sem authorizeActor (§2.6) — polling por token, sem sessão. Junta os chamados do escopo do painel
// (uma fila ou todas) com os nomes de responsável (via @/contexts/auth, só quando o painel os
// exibe) e devolve o feed já no formato da tela (shared/board-feed.ts monta as colunas).
export async function getBoardFeed(token: string): Promise<GetBoardFeedResult> {
  if (!isWellFormedToken(token.trim())) {
    return { success: false, error: NOT_FOUND };
  }

  const board = await findBoardByToken(token.trim());
  if (!board) {
    return { success: false, error: NOT_FOUND };
  }

  const tickets = await findTicketListItems({
    queueIds: board.queueId ? [board.queueId] : undefined,
    statuses: BOARD_STATUSES,
  });

  let assigneeNameById: Record<string, string> = {};
  if (board.showAssignee) {
    const assigneeIds = new Set(tickets.map((ticket) => ticket.assigneeUserId).filter((id): id is string => Boolean(id)));
    if (assigneeIds.size > 0) {
      const usersResult = await listUsers();
      if (usersResult.success) {
        assigneeNameById = Object.fromEntries(
          usersResult.data
            .filter((user) => assigneeIds.has(user.id))
            .map((user) => [user.id, user.name?.trim() || user.email]),
        );
      }
    }
  }

  return {
    success: true,
    data: buildBoardFeed({
      label: board.label,
      layout: board.layout,
      queueName: board.queueId ? await findQueueNameById(board.queueId) : null,
      showAssignee: board.showAssignee,
      refreshSeconds: board.refreshSeconds,
      tickets,
      assigneeNameById,
    }),
  };
}
