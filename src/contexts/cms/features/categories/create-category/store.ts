import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { categories } from "../../../database/schema";
import type { CategoryRecord } from "../../../contracts/types";

export async function findCategoryByKey(key: string): Promise<CategoryRecord | null> {
  const [row] = await db.select().from(categories).where(eq(categories.key, key)).limit(1);
  return row ?? null;
}

export async function insertCategory(input: {
  key: string;
  name: string;
  description?: string;
}): Promise<CategoryRecord> {
  const [row] = await db
    .insert(categories)
    .values({ key: input.key, name: input.name, description: input.description ?? null })
    .returning();

  return row;
}
