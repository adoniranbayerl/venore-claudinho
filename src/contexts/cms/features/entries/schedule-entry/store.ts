import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { entries } from "../../../database/schema";
import { toEntryRecord } from "../../../database/entry-content-types";
import type { EntryRecord } from "../../../contracts/types";

export async function findEntryById(id: string): Promise<EntryRecord | null> {
  const [row] = await db.select().from(entries).where(eq(entries.id, id)).limit(1);
  return row ? await toEntryRecord(row) : null;
}

export async function markEntryScheduled(
  id: string,
  fields: { scheduledPublishAt: Date; scheduledArchiveAt: Date | null },
): Promise<EntryRecord> {
  const [row] = await db
    .update(entries)
    .set({
      status: "scheduled",
      scheduledPublishAt: fields.scheduledPublishAt,
      scheduledArchiveAt: fields.scheduledArchiveAt,
      updatedAt: new Date(),
    })
    .where(eq(entries.id, id))
    .returning();

  return toEntryRecord(row);
}
