import { authorizeActor } from "@/contexts/rbac";
import { createPlaylist } from "./service";
import { validateCreatePlaylistInput } from "./validation";
import type { CreatePlaylistInput, CreatePlaylistResult } from "./types";

export async function createPlaylistHandler(input: CreatePlaylistInput): Promise<CreatePlaylistResult> {
  const validationError = validateCreatePlaylistInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor("broadcast.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createPlaylist({ ...input, actorId: authz.actorId });
}
