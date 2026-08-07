import { beginOperation, endOperation } from "@/observability";
import { insertPlaylist } from "./store";
import type { CreatePlaylistCommand, CreatePlaylistResult } from "./types";

export async function createPlaylist(command: CreatePlaylistCommand): Promise<CreatePlaylistResult> {
  const handle = beginOperation({
    useCase: "broadcast.create-playlist",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const record = await insertPlaylist({
    name: command.name.trim(),
    folderPath: command.folderPath?.trim() || null,
  });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
