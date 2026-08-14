import type { OperationResult } from "@/shared/types";

export type SetPlaylistEditorsCommand = { playlistId: string; userIds: string[]; actorId: string };
export type SetPlaylistEditorsInput = Omit<SetPlaylistEditorsCommand, "actorId">;
export type SetPlaylistEditorsResult = OperationResult<{ playlistId: string; userIds: string[] }>;
