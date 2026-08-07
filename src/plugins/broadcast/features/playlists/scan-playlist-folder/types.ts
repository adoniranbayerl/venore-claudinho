import type { OperationResult } from "@/shared/types";

export type ScanPlaylistFolderCommand = { playlistId: string; actorId: string };
export type ScanPlaylistFolderInput = { playlistId: string };
export type ScanPlaylistFolderResult = OperationResult<{ added: number; removed: number }>;
