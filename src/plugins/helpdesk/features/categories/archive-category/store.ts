import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { categories } from "../../../database/schema";
import type { CategoryRecord } from "../../../contracts/types";

export async function findCategoryById(id: string): Promise<CategoryRecord | null> {
  const [row] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return (row as CategoryRecord) ?? null;
}

export async function setCategoryArchived(id: string, archivedAt: Date | null): Promise<CategoryRecord> {
  const [row] = await db
    .update(categories)
    .set({ archivedAt, updatedAt: new Date() })
    .where(eq(categories.id, id))
    .returning();
  return row as CategoryRecord;
}
