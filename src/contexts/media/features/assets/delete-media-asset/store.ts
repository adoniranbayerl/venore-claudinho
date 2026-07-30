import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { assets } from "../../../database/schema";
import type { MediaAsset } from "../../../contracts/types";

export async function findAssetById(id: string): Promise<MediaAsset | null> {
  const [row] = await db.select().from(assets).where(eq(assets.id, id)).limit(1);
  return (row as MediaAsset) ?? null;
}

export async function softDeleteAssetById(id: string): Promise<void> {
  const now = new Date();
  await db.update(assets).set({ deletedAt: now, updatedAt: now }).where(eq(assets.id, id));
}
