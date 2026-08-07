import type { OperationResult } from "@/shared/types";
import type { BroadcastPlaylistItemRecord } from "../../../contracts/types";

export type AddMediaAssetPlaylistItemCommand = {
  playlistId: string;
  mediaAssetId: string;
  title?: string | null;
  // Só faz diferença quando o asset é imagem (vídeo usa a duração natural do arquivo) — ver
  // get-output-state pra como isso é lido de volta.
  durationSeconds?: number | null;
  actorId: string;
};

export type AddMediaAssetPlaylistItemInput = Omit<AddMediaAssetPlaylistItemCommand, "actorId">;
export type AddMediaAssetPlaylistItemResult = OperationResult<BroadcastPlaylistItemRecord>;
