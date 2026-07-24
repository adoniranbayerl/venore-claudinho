import { and, eq, lt } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { lessonRequirements, lessonTextCompletions, lessonVideoCompletions, lessons } from "../database/schema";
import type { LessonRecord, LessonRequirementsRecord } from "../contracts/types";

export async function findLessonRequirements(lessonId: string): Promise<LessonRequirementsRecord | null> {
  const [row] = await db.select().from(lessonRequirements).where(eq(lessonRequirements.lessonId, lessonId)).limit(1);
  return (row as LessonRequirementsRecord) ?? null;
}

export async function hasTextCompletion(lessonId: string, actorId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: lessonTextCompletions.id })
    .from(lessonTextCompletions)
    .where(and(eq(lessonTextCompletions.lessonId, lessonId), eq(lessonTextCompletions.actorId, actorId)))
    .limit(1);
  return row !== undefined;
}

export async function hasVideoCompletion(lessonId: string, actorId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: lessonVideoCompletions.id })
    .from(lessonVideoCompletions)
    .where(and(eq(lessonVideoCompletions.lessonId, lessonId), eq(lessonVideoCompletions.actorId, actorId)))
    .limit(1);
  return row !== undefined;
}

export async function findPreviousLessonByPosition(courseId: string, position: number): Promise<LessonRecord | null> {
  const rows = await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.courseId, courseId), lt(lessons.position, position)))
    .orderBy(lessons.position);

  const previous = rows.at(-1);
  return (previous as LessonRecord) ?? null;
}
