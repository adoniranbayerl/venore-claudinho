import { authorizeActor } from "@/contexts/rbac";
import { addScannedPlaylistItems } from "./service";
import { validateAddScannedPlaylistItemsInput } from "./validation";
import type { AddScannedPlaylistItemsInput, AddScannedPlaylistItemsResult } from "./types";

export async function addScannedPlaylistItemsHandler(
  input: AddScannedPlaylistItemsInput,
): Promise<AddScannedPlaylistItemsResult> {
  const validationError = validateAddScannedPlaylistItemsInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor("broadcast.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return addScannedPlaylistItems({ ...input, actorId: authz.actorId });
}
