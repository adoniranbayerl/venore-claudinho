import type { OperationResult } from "@/shared/types";

// Record<playlistId, userId[]> — lista vazia pra uma playlist significa "sem responsável atribuído".
export type ListPlaylistEditorsResult = OperationResult<Record<string, string[]>>;
