import type { OperationResult } from "@/shared/types";
import type { BroadcastPlaylistItemRecord } from "../../../contracts/types";

export type ListPlaylistItemsQuery = { playlistId: string };
export type ListPlaylistItemsResult = OperationResult<BroadcastPlaylistItemRecord[]>;
