import { authorizeActor } from "@/contexts/rbac";
import { deletePlaylistItem } from "./service";
import type { DeletePlaylistItemInput, DeletePlaylistItemResult } from "./types";

export async function deletePlaylistItemHandler(input: DeletePlaylistItemInput): Promise<DeletePlaylistItemResult> {
  const authz = await authorizeActor("broadcast.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return deletePlaylistItem(input);
}
