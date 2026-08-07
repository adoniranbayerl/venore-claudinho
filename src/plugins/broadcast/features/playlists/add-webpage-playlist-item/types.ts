import type { OperationResult } from "@/shared/types";
import type { BroadcastPlaylistItemRecord } from "../../../contracts/types";

export type AddWebpagePlaylistItemCommand = {
  playlistId: string;
  url: string;
  title?: string | null;
  durationSeconds?: number | null;
  actorId: string;
};

export type AddWebpagePlaylistItemInput = Omit<AddWebpagePlaylistItemCommand, "actorId">;
export type AddWebpagePlaylistItemResult = OperationResult<BroadcastPlaylistItemRecord>;
