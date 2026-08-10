import { authorizeActor } from "@/contexts/rbac";
import { deletePlaylist } from "./service";
import type { DeletePlaylistInput, DeletePlaylistResult } from "./types";

export async function deletePlaylistHandler(input: DeletePlaylistInput): Promise<DeletePlaylistResult> {
  const authz = await authorizeActor("broadcast.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return deletePlaylist(input);
}
