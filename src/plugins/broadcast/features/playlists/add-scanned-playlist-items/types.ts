import type { OperationResult } from "@/shared/types";
import type { BroadcastPlaylistItemRecord } from "../../../contracts/types";

export type AddScannedPlaylistItemsCommand = { playlistId: string; relativePaths: string[]; actorId: string };
export type AddScannedPlaylistItemsInput = Omit<AddScannedPlaylistItemsCommand, "actorId">;
export type AddScannedPlaylistItemsResult = OperationResult<BroadcastPlaylistItemRecord[]>;
