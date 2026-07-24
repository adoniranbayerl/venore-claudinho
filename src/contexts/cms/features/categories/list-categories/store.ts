import { db } from "@/infrastructure/database/client";
import { categories } from "../../../database/schema";
import type { CategoryRecord } from "../../../contracts/types";

export async function findAllCategories(): Promise<CategoryRecord[]> {
  return db.select().from(categories);
}
