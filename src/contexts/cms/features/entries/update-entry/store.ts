import { eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { entries } from "../../../database/schema";
import type { EntryRecord } from "../../../contracts/types";

export async function findEntryById(id: string): Promise<EntryRecord | null> {
  const [row] = await db.select().from(entries).where(eq(entries.id, id)).limit(1);
  return (row as EntryRecord) ?? null;
}

export async function updateEntryFields(
  id: string,
  changes: {
    title?: string;
    slug?: string;
    categoryId?: string | null;
    data?: unknown;
    mediaId?: string | null;
  },
): Promise<EntryRecord> {
  const [row] = await db
    .update(entries)
    .set({ ...changes, updatedAt: sql`now()` })
    .where(eq(entries.id, id))
    .returning();

  return row as EntryRecord;
}
