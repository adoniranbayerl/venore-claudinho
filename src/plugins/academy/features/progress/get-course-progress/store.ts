import { and, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { courses, lessonTextCompletions, lessonVideoCompletions, lessons, quizAttempts } from "../../../database/schema";
import type { CourseRecord, LessonRecord, QuizAttemptRecord } from "../../../contracts/types";

export async function findCourseById(id: string): Promise<CourseRecord | null> {
  const [row] = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return (row as CourseRecord) ?? null;
}

export async function findLessonsByCourse(courseId: string): Promise<LessonRecord[]> {
  const rows = await db.select().from(lessons).where(eq(lessons.courseId, courseId)).orderBy(lessons.position);
  return rows as LessonRecord[];
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

export async function findQuizAttempts(lessonId: string, actorId: string): Promise<QuizAttemptRecord[]> {
  const rows = await db
    .select()
    .from(quizAttempts)
    .where(and(eq(quizAttempts.lessonId, lessonId), eq(quizAttempts.actorId, actorId)));
  return rows as QuizAttemptRecord[];
}
