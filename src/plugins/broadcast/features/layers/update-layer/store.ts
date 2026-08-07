import { eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { broadcastLayers } from "../../../database/schema";
import type { BroadcastLayerRecord } from "../../../contracts/types";

export async function findLayerById(id: string): Promise<BroadcastLayerRecord | null> {
  const [row] = await db.select().from(broadcastLayers).where(eq(broadcastLayers.id, id)).limit(1);
  return (row as BroadcastLayerRecord) ?? null;
}

export async function applyLayerUpdate(input: {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  config: Record<string, unknown>;
  visible: boolean;
}): Promise<BroadcastLayerRecord> {
  const { id, ...rest } = input;
  const [row] = await db
    .update(broadcastLayers)
    .set({ ...rest, updatedAt: sql`now()` })
    .where(eq(broadcastLayers.id, id))
    .returning();
  return row as BroadcastLayerRecord;
}
