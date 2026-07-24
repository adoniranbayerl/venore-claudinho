import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { categories } from "../../../database/schema";
import type { CategoryRecord } from "../../../contracts/types";

export async function findCategoryBySlug(slug: string): Promise<CategoryRecord | null> {
  const [row] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return (row as CategoryRecord) ?? null;
}
