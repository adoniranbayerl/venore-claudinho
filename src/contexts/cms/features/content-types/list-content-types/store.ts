import { asc, count, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { contentTypes, entryContentTypes } from "../../../database/schema";
import type { ContentTypeRecord } from "../../../contracts/types";

// Contagem de conteúdos por tag (Fase 3/C8 — docs/implementation-roadmap.md), mesmo padrão de
// findAllMenusWithItemCount (features/menus/list-menus/store.ts) e de
// findAllCategoriesWithEntryCount: left join + count + groupBy através do junction N:N
// (entry_content_types), não uma query por tag.
export async function findAllContentTypesWithEntryCount(): Promise<Array<ContentTypeRecord & { entryCount: number }>> {
  const rows = await db
    .select({ contentType: contentTypes, entryCount: count(entryContentTypes.entryId) })
    .from(contentTypes)
    .leftJoin(entryContentTypes, eq(entryContentTypes.contentTypeId, contentTypes.id))
    .groupBy(contentTypes.id)
    .orderBy(asc(contentTypes.name));

  return rows.map((row) => ({ ...(row.contentType as ContentTypeRecord), entryCount: row.entryCount }));
}
