import { desc } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { files } from "../../../database/schema";
import type { MediaRecord } from "../../../contracts/types";

export async function findAllMedia(): Promise<MediaRecord[]> {
  const rows = await db.select().from(files).orderBy(desc(files.createdAt));
  return rows as MediaRecord[];
}
