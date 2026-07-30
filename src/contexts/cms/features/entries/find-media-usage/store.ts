import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { entries } from "../../../database/schema";

export async function findEntriesByMediaId(mediaId: string): Promise<{ id: string; title: string }[]> {
  return db.select({ id: entries.id, title: entries.title }).from(entries).where(eq(entries.mediaId, mediaId));
}
