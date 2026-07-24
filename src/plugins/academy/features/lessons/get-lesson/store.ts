import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { lessons } from "../../../database/schema";
import type { LessonRecord } from "../../../contracts/types";

export async function findLessonById(id: string): Promise<LessonRecord | null> {
  const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return (row as LessonRecord) ?? null;
}
