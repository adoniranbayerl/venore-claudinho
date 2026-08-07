import { eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { broadcastPlaylistItems } from "../../../database/schema";
import type { BroadcastPlaylistItemRecord } from "../../../contracts/types";

export async function applyPlaylistItemHidden(id: string, hidden: boolean): Promise<BroadcastPlaylistItemRecord | null> {
  const [row] = await db
    .update(broadcastPlaylistItems)
    .set({ hidden, updatedAt: sql`now()` })
    .where(eq(broadcastPlaylistItems.id, id))
    .returning();
  return (row as BroadcastPlaylistItemRecord) ?? null;
}
