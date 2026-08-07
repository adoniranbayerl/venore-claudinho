import type { OperationResult } from "@/shared/types";
import type { BroadcastPlaylistItemRecord } from "../../../contracts/types";

export type TogglePlaylistItemVisibilityInput = { itemId: string; hidden: boolean };
export type TogglePlaylistItemVisibilityResult = OperationResult<BroadcastPlaylistItemRecord>;
