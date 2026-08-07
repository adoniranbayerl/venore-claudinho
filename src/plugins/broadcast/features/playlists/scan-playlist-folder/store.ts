import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { broadcastPlaylistItems, broadcastPlaylists } from "../../../database/schema";
import type { BroadcastPlaylistItemRecord, BroadcastPlaylistRecord } from "../../../contracts/types";

export async function findPlaylistById(id: string): Promise<BroadcastPlaylistRecord | null> {
  const [row] = await db.select().from(broadcastPlaylists).where(eq(broadcastPlaylists.id, id)).limit(1);
  return (row as BroadcastPlaylistRecord) ?? null;
}

export async function findLocalPlaylistItemsByPlaylistId(playlistId: string): Promise<BroadcastPlaylistItemRecord[]> {
  const rows = await db
    .select()
    .from(broadcastPlaylistItems)
    .where(and(eq(broadcastPlaylistItems.playlistId, playlistId), eq(broadcastPlaylistItems.sourceType, "local")));
  return rows as BroadcastPlaylistItemRecord[];
}

export async function findMaxPlaylistItemOrder(playlistId: string): Promise<number> {
  const rows = await db
    .select({ order: broadcastPlaylistItems.order })
    .from(broadcastPlaylistItems)
    .where(eq(broadcastPlaylistItems.playlistId, playlistId))
    .orderBy(desc(broadcastPlaylistItems.order))
    .limit(1);
  return rows[0]?.order ?? -1;
}

export async function insertLocalPlaylistItems(
  items: { playlistId: string; order: number; title: string | null; relativePath: string }[],
): Promise<void> {
  if (items.length === 0) return;
  await db
    .insert(broadcastPlaylistItems)
    .values(items.map((item) => ({ ...item, sourceType: "local" as const, mediaAssetId: null })));
}

export async function deletePlaylistItemsByIds(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await db.delete(broadcastPlaylistItems).where(inArray(broadcastPlaylistItems.id, ids));
}
