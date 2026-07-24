import { and, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { entries } from "../../../database/schema";
import type { EntryRecord } from "../../../contracts/types";

export async function findPublishedEntries(filters: {
  contentTypeId?: string;
  categoryId?: string;
}): Promise<EntryRecord[]> {
  const conditions = [eq(entries.status, "published")];
  if (filters.contentTypeId) {
    conditions.push(eq(entries.contentTypeId, filters.contentTypeId));
  }
  if (filters.categoryId) {
    conditions.push(eq(entries.categoryId, filters.categoryId));
  }

  const rows = await db
    .select()
    .from(entries)
    .where(and(...conditions));

  return rows as EntryRecord[];
}
