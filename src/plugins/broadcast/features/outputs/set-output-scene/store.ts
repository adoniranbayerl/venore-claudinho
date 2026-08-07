import { eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { broadcastOutputs, broadcastScenes } from "../../../database/schema";
import type { BroadcastOutputRecord, BroadcastSceneRecord } from "../../../contracts/types";

export async function findOutputById(id: string): Promise<BroadcastOutputRecord | null> {
  const [row] = await db.select().from(broadcastOutputs).where(eq(broadcastOutputs.id, id)).limit(1);
  return (row as BroadcastOutputRecord) ?? null;
}

export async function findSceneById(id: string): Promise<BroadcastSceneRecord | null> {
  const [row] = await db.select().from(broadcastScenes).where(eq(broadcastScenes.id, id)).limit(1);
  return (row as BroadcastSceneRecord) ?? null;
}

export async function applyOutputScene(input: { id: string; sceneId: string | null }): Promise<BroadcastOutputRecord> {
  const [row] = await db
    .update(broadcastOutputs)
    .set({ currentSceneId: input.sceneId, updatedAt: sql`now()` })
    .where(eq(broadcastOutputs.id, input.id))
    .returning();
  return row as BroadcastOutputRecord;
}
