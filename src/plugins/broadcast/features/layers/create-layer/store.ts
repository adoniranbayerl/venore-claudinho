import { db } from "@/infrastructure/database/client";
import { broadcastLayers } from "../../../database/schema";
import type { BroadcastLayerRecord, BroadcastLayerType } from "../../../contracts/types";

export async function insertLayer(input: {
  sceneId: string;
  type: BroadcastLayerType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  config: Record<string, unknown>;
  visible: boolean;
}): Promise<BroadcastLayerRecord> {
  const [row] = await db.insert(broadcastLayers).values(input).returning();
  return row as BroadcastLayerRecord;
}
