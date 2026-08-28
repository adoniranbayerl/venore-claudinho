import { asc, count, eq, inArray } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { categories, entries } from "../../../database/schema";
import type { CategoryRecord } from "../../../contracts/types";

// Mesmo shape de features/categories/list-categories/store.ts (left join + count + groupBy), com
// um recorte opcional por id — a versão administrativa e escopável do catálogo. O público
// (list-categories) continua vendo todas.
export async function findCategoriesWithEntryCount(
  allowedCategoryIds?: string[],
): Promise<Array<CategoryRecord & { entryCount: number }>> {
  const rows = await db
    .select({ category: categories, entryCount: count(entries.id) })
    .from(categories)
    .leftJoin(entries, eq(entries.categoryId, categories.id))
    .where(allowedCategoryIds !== undefined ? inArray(categories.id, allowedCategoryIds) : undefined)
    .groupBy(categories.id)
    .orderBy(asc(categories.name));

  return rows.map((row) => ({ ...(row.category as CategoryRecord), entryCount: row.entryCount }));
}
