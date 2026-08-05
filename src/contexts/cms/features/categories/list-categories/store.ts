import { asc, count, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { categories, entries } from "../../../database/schema";
import type { CategoryRecord } from "../../../contracts/types";

// Contagem de conteúdos por categoria (Fase 3/C8 — docs/implementation-roadmap.md), mesmo padrão
// de findAllMenusWithItemCount (features/menus/list-menus/store.ts): left join + count + groupBy,
// não uma segunda query por categoria. Conta em qualquer status (rascunho a arquivado) — mesmo
// critério da listagem de admin de conteúdos, que também não filtra por status.
export async function findAllCategoriesWithEntryCount(): Promise<Array<CategoryRecord & { entryCount: number }>> {
  const rows = await db
    .select({ category: categories, entryCount: count(entries.id) })
    .from(categories)
    .leftJoin(entries, eq(entries.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.name));

  return rows.map((row) => ({ ...(row.category as CategoryRecord), entryCount: row.entryCount }));
}
