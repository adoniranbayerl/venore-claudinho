import { authorizeActor } from "@/contexts/rbac";
import { listPlaylists } from "./service";
import type { ListPlaylistsResult } from "./types";

export async function listPlaylistsHandler(): Promise<ListPlaylistsResult> {
  const authz = await authorizeActor("broadcast.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listPlaylists();
}
