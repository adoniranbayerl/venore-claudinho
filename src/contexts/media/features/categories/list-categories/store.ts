import { asc } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { categories } from "../../../database/schema";
import type { MediaCategory } from "../../../contracts/types";

export async function findAllCategories(): Promise<MediaCategory[]> {
  const rows = await db.select().from(categories).orderBy(asc(categories.name));
  return rows;
}
