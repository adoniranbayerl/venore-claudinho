import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import { listMetricsBoards } from "@/plugins/company-metrics";
import { addWebpagePlaylistItem } from "../add-webpage-playlist-item/service";
import type { AddMetricsBoardPlaylistItemCommand, AddMetricsBoardPlaylistItemResult } from "./types";

// Resolve o token num painel real do company-metrics e delega ao mesmo caminho do item "webpage"
// (a view de saída renderiza os dois com o mesmo <iframe>). Se o plugin company-metrics não está
// ativo, recusa com erro claro — dependência OPCIONAL (ver manifest.ts / §9.3).
export async function addMetricsBoardPlaylistItem(
  command: AddMetricsBoardPlaylistItemCommand,
): Promise<AddMetricsBoardPlaylistItemResult> {
  if (!(await isPluginActive("company-metrics"))) {
    return {
      success: false,
      error: {
        code: "broadcast.add-metrics-board-playlist-item.plugin_inactive",
        message: "O plugin Métricas Internas não está instalado.",
      },
    };
  }

  const boards = await listMetricsBoards();
  if (!boards.success) {
    return { success: false, error: boards.error };
  }
  const board = boards.data.find((entry) => entry.token === command.boardToken);
  if (!board) {
    return {
      success: false,
      error: {
        code: "broadcast.add-metrics-board-playlist-item.board_not_found",
        message: "Painel de métricas não encontrado.",
      },
    };
  }

  return addWebpagePlaylistItem({
    playlistId: command.playlistId,
    url: `/company-metrics/tv/${board.token}`,
    title: command.title?.trim() || board.label,
    durationSeconds: command.durationSeconds ?? null,
    withAudio: false,
    actorId: command.actorId,
  });
}
