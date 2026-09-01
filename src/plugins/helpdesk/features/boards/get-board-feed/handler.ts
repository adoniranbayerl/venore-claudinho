import { getBoardFeed } from "./service";
import type { GetBoardFeedResult } from "./types";

// Sem authorizeActor de propósito (§2.6) — o painel faz polling por token, sem sessão.
export async function getBoardFeedHandler(token: string): Promise<GetBoardFeedResult> {
  return getBoardFeed(token);
}
