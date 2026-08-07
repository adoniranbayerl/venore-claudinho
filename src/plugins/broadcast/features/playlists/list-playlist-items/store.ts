import { asc, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { broadcastPlaylistItems } from "../../../database/schema";
import type { BroadcastPlaylistItemRecord } from "../../../contracts/types";

export async function findPlaylistItemsByPlaylistId(playlistId: string): Promise<BroadcastPlaylistItemRecord[]> {
  const rows = await db
    .select()
    .from(broadcastPlaylistItems)
    .where(eq(broadcastPlaylistItems.playlistId, playlistId))
    .orderBy(asc(broadcastPlaylistItems.order));
  return rows as BroadcastPlaylistItemRecord[];
}
