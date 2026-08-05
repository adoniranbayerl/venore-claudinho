import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { entries } from "../../../database/schema";
import { replaceEntryContentTypes } from "../../../database/entry-content-types";
import type { EntryRecord } from "../../../contracts/types";

// Unicidade pública é por (categoryId, slug) — content type nunca aparece na URL
// (docs/venore-docks.md — decisão de rota pública /<slug> ou /<categoria>/<slug>).
export async function findEntryByCategoryAndSlug(
  categoryId: string | null,
  slug: string,
): Promise<EntryRecord | null> {
  const [row] = await db
    .select()
    .from(entries)
    .where(
      and(categoryId ? eq(entries.categoryId, categoryId) : isNull(entries.categoryId), eq(entries.slug, slug)),
    )
    .limit(1);

  return (row as EntryRecord) ?? null;
}

export async function insertEntry(input: {
  contentTypeIds: string[];
  categoryId?: string;
  title: string;
  slug: string;
  visibility?: "public" | "authenticated";
  data?: unknown;
  mediaId?: string;
  internalOwner?: string;
  authorId: string;
}): Promise<EntryRecord> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(entries)
      .values({
        categoryId: input.categoryId ?? null,
        title: input.title,
        slug: input.slug,
        visibility: input.visibility ?? "public",
        data: input.data ?? {},
        mediaId: input.mediaId ?? null,
        internalOwner: input.internalOwner ?? null,
        authorId: input.authorId,
      })
      .returning();

    await replaceEntryContentTypes(tx, row.id, input.contentTypeIds);

    return { ...row, contentTypeIds: input.contentTypeIds } as EntryRecord;
  });
}
