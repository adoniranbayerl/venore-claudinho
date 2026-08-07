import { authorizeActor } from "@/contexts/rbac";
import { addMediaAssetPlaylistItem } from "./service";
import { validateAddMediaAssetPlaylistItemInput } from "./validation";
import type { AddMediaAssetPlaylistItemInput, AddMediaAssetPlaylistItemResult } from "./types";

export async function addMediaAssetPlaylistItemHandler(
  input: AddMediaAssetPlaylistItemInput,
): Promise<AddMediaAssetPlaylistItemResult> {
  const validationError = validateAddMediaAssetPlaylistItemInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor("broadcast.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return addMediaAssetPlaylistItem({ ...input, actorId: authz.actorId });
}
