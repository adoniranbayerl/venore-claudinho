import { and, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { entries } from "../../../database/schema";
import type { EntryRecord, EntryStatus } from "../../../contracts/types";

export async function findAllEntries(filters: {
  contentTypeId?: string;
  categoryId?: string;
  status?: EntryStatus;
}): Promise<EntryRecord[]> {
  const conditions = [];
  if (filters.contentTypeId) {
    conditions.push(eq(entries.contentTypeId, filters.contentTypeId));
  }
  if (filters.categoryId) {
    conditions.push(eq(entries.categoryId, filters.categoryId));
  }
  if (filters.status) {
    conditions.push(eq(entries.status, filters.status));
  }

  const rows = await db
    .select()
    .from(entries)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return rows as EntryRecord[];
}
