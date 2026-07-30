import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { categories, files } from "../../../database/schema";
import type { MediaRecord } from "../../../contracts/types";

export async function findMediaById(id: string): Promise<MediaRecord | null> {
  const [row] = await db.select().from(files).where(eq(files.id, id)).limit(1);
  return (row as MediaRecord) ?? null;
}

export async function findCategoryById(id: string): Promise<{ id: string } | null> {
  const [row] = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, id)).limit(1);
  return row ?? null;
}

export async function updateCategoryOnFile(id: string, categoryId: string | null): Promise<MediaRecord> {
  const [row] = await db.update(files).set({ categoryId }).where(eq(files.id, id)).returning();
  return row as MediaRecord;
}
