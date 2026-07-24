import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { files } from "../../../database/schema";
import type { MediaRecord } from "../../../contracts/types";

export async function findMediaById(id: string): Promise<MediaRecord | null> {
  const [row] = await db.select().from(files).where(eq(files.id, id)).limit(1);
  return (row as MediaRecord) ?? null;
}
