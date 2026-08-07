import { authorizeActor } from "@/contexts/rbac";
import { togglePlaylistItemVisibility } from "./service";
import type { TogglePlaylistItemVisibilityInput, TogglePlaylistItemVisibilityResult } from "./types";

export async function togglePlaylistItemVisibilityHandler(
  input: TogglePlaylistItemVisibilityInput,
): Promise<TogglePlaylistItemVisibilityResult> {
  const authz = await authorizeActor("broadcast.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return togglePlaylistItemVisibility(input);
}
