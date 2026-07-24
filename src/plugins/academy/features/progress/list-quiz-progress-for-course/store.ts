import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { lessons } from "../../../database/schema";
import type { LessonRecord } from "../../../contracts/types";

export async function findLessonsByCourse(courseId: string): Promise<LessonRecord[]> {
  const rows = await db.select().from(lessons).where(eq(lessons.courseId, courseId)).orderBy(lessons.position);
  return rows as LessonRecord[];
}
