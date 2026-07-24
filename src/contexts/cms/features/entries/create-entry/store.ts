import { and, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { entries } from "../../../database/schema";
import type { EntryRecord } from "../../../contracts/types";

export async function findEntryByContentTypeAndSlug(
  contentTypeId: string,
  slug: string,
): Promise<EntryRecord | null> {
  const [row] = await db
    .select()
    .from(entries)
    .where(and(eq(entries.contentTypeId, contentTypeId), eq(entries.slug, slug)))
    .limit(1);

  return (row as EntryRecord) ?? null;
}

export async function insertEntry(input: {
  contentTypeId: string;
  categoryId?: string;
  title: string;
  slug: string;
  data?: unknown;
  mediaId?: string;
  authorId: string;
}): Promise<EntryRecord> {
  const [row] = await db
    .insert(entries)
    .values({
      contentTypeId: input.contentTypeId,
      categoryId: input.categoryId ?? null,
      title: input.title,
      slug: input.slug,
      data: input.data ?? {},
      mediaId: input.mediaId ?? null,
      authorId: input.authorId,
    })
    .returning();

  return row as EntryRecord;
}
