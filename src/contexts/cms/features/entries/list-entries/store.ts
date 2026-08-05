import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { entries, entryContentTypes } from "../../../database/schema";
import { toEntryRecords } from "../../../database/entry-content-types";
import type { EntryRecord } from "../../../contracts/types";

export async function findPublishedEntries(filters: {
  contentTypeId?: string;
  categoryId?: string;
}): Promise<EntryRecord[]> {
  const conditions = [eq(entries.status, "published")];
  if (filters.contentTypeId) {
    const contentTypeId = filters.contentTypeId;
    conditions.push(
      inArray(
        entries.id,
        db.select({ id: entryContentTypes.entryId }).from(entryContentTypes).where(eq(entryContentTypes.contentTypeId, contentTypeId)),
      ),
    );
  }
  if (filters.categoryId) {
    conditions.push(eq(entries.categoryId, filters.categoryId));
  }

  const rows = await db
    .select()
    .from(entries)
    .where(and(...conditions));

  return toEntryRecords(rows);
}
