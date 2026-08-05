import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { lessonActivities } from "../../../database/schema";
import type { LessonActivityRecord } from "../../../contracts/types";

export async function findLessonActivitiesByLesson(lessonId: string): Promise<LessonActivityRecord[]> {
  const rows = await db
    .select()
    .from(lessonActivities)
    .where(eq(lessonActivities.lessonId, lessonId))
    .orderBy(lessonActivities.position);
  return rows as LessonActivityRecord[];
}
