import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { files } from "../../../database/schema";
import type { MediaRecord } from "../../../contracts/types";

// Sem filtro de visibilidade de propósito: o único chamador (delete-media/handler.ts) já exige
// authorizeActor("media.manage") antes de chegar aqui, e quem administra mídia enxerga tudo por
// definição do modelo (mesma regra do bypass em list-media/get-media store).
export async function findMediaById(id: string): Promise<MediaRecord | null> {
  const [row] = await db.select().from(files).where(eq(files.id, id)).limit(1);
  return (row as MediaRecord) ?? null;
}

export async function deleteMediaById(id: string): Promise<void> {
  await db.delete(files).where(eq(files.id, id));
}
