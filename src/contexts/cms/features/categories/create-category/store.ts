import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { categories } from "../../../database/schema";
import type { CategoryRecord } from "../../../contracts/types";

export async function findCategoryByKey(key: string): Promise<CategoryRecord | null> {
  const [row] = await db.select().from(categories).where(eq(categories.key, key)).limit(1);
  return row ?? null;
}

export async function findCategoryBySlug(slug: string): Promise<CategoryRecord | null> {
  const [row] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return row ?? null;
}

export async function insertCategory(input: {
  key: string;
  slug: string;
  name: string;
  description?: string;
}): Promise<CategoryRecord> {
  const [row] = await db
    .insert(categories)
    .values({ key: input.key, slug: input.slug, name: input.name, description: input.description ?? null })
    .returning();

  return row;
}
