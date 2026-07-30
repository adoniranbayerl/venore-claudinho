import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { categories } from "../../../database/schema";
import type { MediaCategory } from "../../../contracts/types";

export async function findCategoryById(id: string): Promise<MediaCategory | null> {
  const [row] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return row ?? null;
}

export async function updateCategoryName(id: string, name: string): Promise<MediaCategory> {
  const [row] = await db.update(categories).set({ name }).where(eq(categories.id, id)).returning();
  return row;
}
