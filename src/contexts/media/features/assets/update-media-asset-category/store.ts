import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { assets, categories } from "../../../database/schema";
import type { MediaAsset } from "../../../contracts/types";

export async function findAssetById(id: string): Promise<MediaAsset | null> {
  const [row] = await db.select().from(assets).where(eq(assets.id, id)).limit(1);
  return (row as MediaAsset) ?? null;
}

export async function findCategoryById(id: string): Promise<{ id: string } | null> {
  const [row] = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, id)).limit(1);
  return row ?? null;
}

export async function updateCategoryOnAsset(id: string, categoryId: string | null): Promise<MediaAsset> {
  const [row] = await db.update(assets).set({ categoryId, updatedAt: new Date() }).where(eq(assets.id, id)).returning();
  return row as MediaAsset;
}
