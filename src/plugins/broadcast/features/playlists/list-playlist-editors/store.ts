import { db } from "@/infrastructure/database/client";
import { broadcastPlaylistEditors } from "../../../database/schema";

export async function findAllPlaylistEditorLinks(): Promise<{ playlistId: string; userId: string }[]> {
  return db.select({ playlistId: broadcastPlaylistEditors.playlistId, userId: broadcastPlaylistEditors.userId }).from(broadcastPlaylistEditors);
}
