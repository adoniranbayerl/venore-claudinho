import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { assets } from "../../../database/schema";

export async function clearCategoryFromAssets(categoryId: string): Promise<number> {
  const rows = await db.update(assets).set({ categoryId: null }).where(eq(assets.categoryId, categoryId)).returning({ id: assets.id });
  return rows.length;
}
