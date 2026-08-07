import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { broadcastLayers } from "../../../database/schema";

export async function deleteLayerById(id: string): Promise<boolean> {
  const rows = await db.delete(broadcastLayers).where(eq(broadcastLayers.id, id)).returning({ id: broadcastLayers.id });
  return rows.length > 0;
}
