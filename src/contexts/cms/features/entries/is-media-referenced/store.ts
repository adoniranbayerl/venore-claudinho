import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { entries } from "../../../database/schema";

export async function findAnyEntryByMediaId(mediaId: string): Promise<boolean> {
  const [row] = await db.select({ id: entries.id }).from(entries).where(eq(entries.mediaId, mediaId)).limit(1);
  return row !== undefined;
}
