import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { entries } from "../../../database/schema";
import { toEntryRecord } from "../../../database/entry-content-types";
import type { EntryRecord } from "../../../contracts/types";

export async function findPublishedEntryByCategoryAndSlug(
  categoryId: string | null,
  slug: string,
): Promise<EntryRecord | null> {
  const [row] = await db
    .select()
    .from(entries)
    .where(
      and(
        eq(entries.status, "published"),
        categoryId ? eq(entries.categoryId, categoryId) : isNull(entries.categoryId),
        eq(entries.slug, slug),
      ),
    )
    .limit(1);

  return row ? await toEntryRecord(row) : null;
}
