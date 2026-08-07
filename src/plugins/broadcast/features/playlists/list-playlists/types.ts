import type { OperationResult } from "@/shared/types";
import type { BroadcastPlaylistRecord } from "../../../contracts/types";

export type ListPlaylistsResult = OperationResult<BroadcastPlaylistRecord[]>;
