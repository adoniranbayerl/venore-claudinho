import { eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { lessons } from "../../../database/schema";
import type { LessonRecord } from "../../../contracts/types";

export async function findLessonById(id: string): Promise<LessonRecord | null> {
  const [row] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return (row as LessonRecord) ?? null;
}

export async function updateLesson(
  id: string,
  input: { cmsEntryId?: string; videoUrl?: string },
): Promise<LessonRecord> {
  const [row] = await db
    .update(lessons)
    .set({ ...input, updatedAt: sql`now()` })
    .where(eq(lessons.id, id))
    .returning();

  return row as LessonRecord;
}
