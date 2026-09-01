import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { categories } from "../../../database/schema";
import type { CategoryRecord } from "../../../contracts/types";

export async function findCategoryById(id: string): Promise<CategoryRecord | null> {
  const [row] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return (row as CategoryRecord) ?? null;
}

// key nunca é atualizada — mesmo racional de create-queue/service.ts.
export async function updateCategoryRow(
  id: string,
  input: { label: string; description: string | null },
): Promise<CategoryRecord> {
  const [row] = await db
    .update(categories)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(categories.id, id))
    .returning();
  return row as CategoryRecord;
}
