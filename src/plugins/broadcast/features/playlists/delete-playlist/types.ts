import type { OperationResult } from "@/shared/types";

export type DeletePlaylistInput = { playlistId: string };
export type DeletePlaylistResult = OperationResult<{ id: string }>;
