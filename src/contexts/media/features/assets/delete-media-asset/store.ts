import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { assets } from "../../../database/schema";
import type { MediaAsset } from "../../../contracts/types";

// Sem filtro de visibilidade de propósito: o único chamador (delete-media-asset/handler.ts) já
// exige authorizeActor("media.manage") antes de chegar aqui.
export async function findAssetById(id: string): Promise<MediaAsset | null> {
  const [row] = await db.select().from(assets).where(eq(assets.id, id)).limit(1);
  return (row as MediaAsset) ?? null;
}

export async function softDeleteAssetById(id: string): Promise<void> {
  const now = new Date();
  await db.update(assets).set({ deletedAt: now, updatedAt: now }).where(eq(assets.id, id));
}
