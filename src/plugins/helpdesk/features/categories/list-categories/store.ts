import { and, asc, eq, isNull, type SQL } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { categories } from "../../../database/schema";
import type { CategoryRecord } from "../../../contracts/types";

export async function findCategories(queueId: string, includeArchived: boolean): Promise<CategoryRecord[]> {
  const conditions: SQL[] = [eq(categories.queueId, queueId)];
  if (!includeArchived) conditions.push(isNull(categories.archivedAt));

  const rows = await db
    .select()
    .from(categories)
    .where(and(...conditions))
    .orderBy(asc(categories.position), asc(categories.createdAt), asc(categories.id));
  return rows as CategoryRecord[];
}
