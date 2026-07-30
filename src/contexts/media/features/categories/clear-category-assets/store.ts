import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { files } from "../../../database/schema";

export async function clearCategoryFromFiles(categoryId: string): Promise<number> {
  const rows = await db.update(files).set({ categoryId: null }).where(eq(files.categoryId, categoryId)).returning({ id: files.id });
  return rows.length;
}
