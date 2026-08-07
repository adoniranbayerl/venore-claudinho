import { authorizeActor } from "@/contexts/rbac";
import { listPlaylistItems } from "./service";
import type { ListPlaylistItemsQuery, ListPlaylistItemsResult } from "./types";

export async function listPlaylistItemsHandler(query: ListPlaylistItemsQuery): Promise<ListPlaylistItemsResult> {
  const authz = await authorizeActor("broadcast.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listPlaylistItems(query);
}
