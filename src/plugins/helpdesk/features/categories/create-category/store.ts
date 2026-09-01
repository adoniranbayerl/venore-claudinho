import { and, eq, max } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { categories, queues } from "../../../database/schema";
import type { CategoryRecord } from "../../../contracts/types";

export async function queueExists(queueId: string): Promise<boolean> {
  const [row] = await db.select({ id: queues.id }).from(queues).where(eq(queues.id, queueId)).limit(1);
  return Boolean(row);
}

export async function categoryKeyExists(queueId: string, key: string): Promise<boolean> {
  const [row] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.queueId, queueId), eq(categories.key, key)))
    .limit(1);
  return Boolean(row);
}

export async function nextCategoryPosition(queueId: string): Promise<number> {
  const [row] = await db
    .select({ maxPosition: max(categories.position) })
    .from(categories)
    .where(eq(categories.queueId, queueId));
  return (row?.maxPosition ?? 0) + 1;
}

export async function insertCategory(input: {
  queueId: string;
  key: string;
  label: string;
  description: string | null;
  position: number;
}): Promise<CategoryRecord> {
  const [row] = await db.insert(categories).values(input).returning();
  return row as CategoryRecord;
}
