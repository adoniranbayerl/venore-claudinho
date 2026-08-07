import { authorizeActor } from "@/contexts/rbac";
import { addWebpagePlaylistItem } from "./service";
import { validateAddWebpagePlaylistItemInput } from "./validation";
import type { AddWebpagePlaylistItemInput, AddWebpagePlaylistItemResult } from "./types";

export async function addWebpagePlaylistItemHandler(
  input: AddWebpagePlaylistItemInput,
): Promise<AddWebpagePlaylistItemResult> {
  const validationError = validateAddWebpagePlaylistItemInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor("broadcast.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return addWebpagePlaylistItem({ ...input, actorId: authz.actorId });
}
