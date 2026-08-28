import { findAllBoards } from "../shared/store";
import type { ListMetricsBoardsResult } from "./types";

// SEM authorizeActor de propósito — devolve só rótulo + token dos painéis (o token já é a
// credencial pública da URL da TV, mesmo espírito de getPresentationAccess do enrollment).
// Consumido por outro plugin (Broadcast) via barrel, com dependência OPCIONAL declarada no
// manifesto do Broadcast — company-metrics não sabe que o Broadcast existe.
export async function listMetricsBoardsHandler(): Promise<ListMetricsBoardsResult> {
  const boards = await findAllBoards();
  return { success: true, data: boards.map((board) => ({ token: board.token, label: board.label })) };
}
