import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { files } from "../../../database/schema";
import type { MediaRecord } from "../../../contracts/types";
import type { MediaVisibility } from "../../../contracts/types";

// Sem filtro de visibilidade/dono de propósito, igual delete-media/store.ts: quem decide se o
// ator pode agir sobre este registro é o service (dono OU media.manage), não o store.
export async function findMediaById(id: string): Promise<MediaRecord | null> {
  const [row] = await db.select().from(files).where(eq(files.id, id)).limit(1);
  return (row as MediaRecord) ?? null;
}

export async function updateVisibility(id: string, visibility: MediaVisibility): Promise<MediaRecord> {
  const [row] = await db.update(files).set({ visibility }).where(eq(files.id, id)).returning();
  return row as MediaRecord;
}
