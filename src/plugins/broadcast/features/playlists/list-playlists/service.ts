import { findAllPlaylists } from "./store";
import type { ListPlaylistsResult } from "./types";

export async function listPlaylists(): Promise<ListPlaylistsResult> {
  return { success: true, data: await findAllPlaylists() };
}
