import { and, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { broadcastLayers, broadcastOutputs } from "../../../database/schema";
import type { BroadcastLayerRecord, BroadcastOutputRecord } from "../../../contracts/types";

export async function findOutputById(id: string): Promise<BroadcastOutputRecord | null> {
  const [row] = await db.select().from(broadcastOutputs).where(eq(broadcastOutputs.id, id)).limit(1);
  return (row as BroadcastOutputRecord) ?? null;
}

// A saída não guarda playlistId direto — quem guarda é a camada "video" da cena padrão dela
// (auto-provisionada em create-output). Uma saída sempre tem exatamente uma camada desse tipo.
export async function findVideoLayerBySceneId(sceneId: string): Promise<BroadcastLayerRecord | null> {
  const [row] = await db
    .select()
    .from(broadcastLayers)
    .where(and(eq(broadcastLayers.sceneId, sceneId), eq(broadcastLayers.type, "video")))
    .limit(1);
  return (row as BroadcastLayerRecord) ?? null;
}

export async function applyVideoLayerPlaylist(layerId: string, config: Record<string, unknown>, playlistId: string): Promise<void> {
  await db
    .update(broadcastLayers)
    .set({ config: { ...config, playlistId } })
    .where(eq(broadcastLayers.id, layerId));
}
