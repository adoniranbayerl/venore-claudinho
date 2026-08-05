import { count, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { assets, categories } from "../../../database/schema";

export async function findCategoryById(id: string): Promise<{ id: string } | null> {
  const [row] = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, id)).limit(1);
  return row ?? null;
}

export async function countAssetsByCategory(categoryId: string): Promise<number> {
  const [row] = await db.select({ value: count() }).from(assets).where(eq(assets.categoryId, categoryId));
  return row?.value ?? 0;
}

export async function deleteCategoryById(id: string): Promise<void> {
  await db.delete(categories).where(eq(categories.id, id));
}
