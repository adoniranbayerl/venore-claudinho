import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { broadcastScenes } from "../../../database/schema";

// Layers da cena são removidas em cascata (FK onDelete: "cascade" no schema); outputs que
// apontavam pra esta cena ficam com currentSceneId = null (onDelete: "set null") — nenhuma das
// duas precisa de limpeza manual aqui.
export async function deleteSceneById(id: string): Promise<boolean> {
  const rows = await db.delete(broadcastScenes).where(eq(broadcastScenes.id, id)).returning({ id: broadcastScenes.id });
  return rows.length > 0;
}
