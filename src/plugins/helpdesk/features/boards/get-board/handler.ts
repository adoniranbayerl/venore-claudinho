import { getBoard } from "./service";
import type { GetBoardResult } from "./types";

// Sem authorizeActor de propósito (§2.6) — a página do painel abre por token, sem sessão.
export async function getBoardHandler(token: string): Promise<GetBoardResult> {
  return getBoard(token);
}
