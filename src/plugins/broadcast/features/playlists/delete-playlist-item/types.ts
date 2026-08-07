import type { OperationResult } from "@/shared/types";

export type DeletePlaylistItemInput = { itemId: string };
export type DeletePlaylistItemResult = OperationResult<{ id: string }>;
