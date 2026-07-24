import { and, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { entries } from "../../../database/schema";
import type { EntryRecord } from "../../../contracts/types";

export async function findPublishedEntryById(id: string): Promise<EntryRecord | null> {
  const [row] = await db
    .select()
    .from(entries)
    .where(and(eq(entries.id, id), eq(entries.status, "published")))
    .limit(1);

  return (row as EntryRecord) ?? null;
}
