import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { categories } from "../../../database/schema";
import type { MediaCategory } from "../../../contracts/types";

export async function findCategoryByKey(key: string): Promise<MediaCategory | null> {
  const [row] = await db.select().from(categories).where(eq(categories.key, key)).limit(1);
  return row ?? null;
}

export async function insertCategory(input: { key: string; name: string }): Promise<MediaCategory> {
  const [row] = await db.insert(categories).values(input).returning();
  return row;
}
