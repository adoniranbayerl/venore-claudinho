import { getTvBoard } from "./service";
import type { GetTvBoardResult } from "./types";

// Sem authorizeActor de propósito — o token na URL é a credencial (mesmo espírito de
// getPresentationAccessHandler do enrollment-dashboard e getOutputStateHandler do broadcast).
// Chamado pela página de TV (server component sem sessão).
export async function getTvBoardHandler(token: string): Promise<GetTvBoardResult> {
  if (!token || token.trim().length === 0) {
    return { success: false, error: { code: "company-metrics.get-tv-board.missing_token", message: "Token não informado." } };
  }
  return getTvBoard(token.trim());
}
