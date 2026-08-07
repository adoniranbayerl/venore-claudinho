import { eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { broadcastScenes } from "../../../database/schema";
import type { BroadcastSceneRecord } from "../../../contracts/types";

export async function findSceneById(id: string): Promise<BroadcastSceneRecord | null> {
  const [row] = await db.select().from(broadcastScenes).where(eq(broadcastScenes.id, id)).limit(1);
  return (row as BroadcastSceneRecord) ?? null;
}

export async function applySceneUpdate(input: { id: string; name: string; order: number }): Promise<BroadcastSceneRecord> {
  const [row] = await db
    .update(broadcastScenes)
    .set({ name: input.name, order: input.order, updatedAt: sql`now()` })
    .where(eq(broadcastScenes.id, input.id))
    .returning();
  return row as BroadcastSceneRecord;
}
