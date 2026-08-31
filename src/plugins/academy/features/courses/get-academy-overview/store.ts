import { and, desc, eq, isNull, ne, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import {
  courses,
  enrollments,
  lessonActivities,
  lessonActivitySubmissions,
  lessons,
  quizAttempts,
} from "../../../database/schema";
import type { CourseStatus } from "../../../contracts/types";

export type OverviewCourseRow = {
  id: string;
  title: string;
  slug: string;
  status: CourseStatus;
  lessonCount: number;
};
export type CountByCourse = { courseId: string; value: number };
export type AvgByCourse = { courseId: string; avg: number | null };
export type PendingSubmissionRow = {
  submissionId: string;
  actorId: string;
  submittedAt: Date;
  activityTitle: string;
  lessonTitle: string;
  courseId: string;
  courseTitle: string;
};

// Cursos + nº de aulas não-draft.
export async function findCoursesWithLessonCount(): Promise<OverviewCourseRow[]> {
  const rows = await db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      status: courses.status,
      lessonCount: sql<number>`count(${lessons.id})::int`,
    })
    .from(courses)
    .leftJoin(lessons, and(eq(lessons.courseId, courses.id), ne(lessons.status, "draft")))
    .groupBy(courses.id)
    .orderBy(desc(courses.createdAt));
  return rows as OverviewCourseRow[];
}

export async function countEnrollmentsByCourse(): Promise<CountByCourse[]> {
  const rows = await db
    .select({ courseId: enrollments.courseId, value: sql<number>`count(*)::int` })
    .from(enrollments)
    .groupBy(enrollments.courseId);
  return rows as CountByCourse[];
}

// (aluno, aula) "feitas" por curso — leitura de texto OU vídeo OU quiz passado (tentativa ativa).
export async function countDoneLessonPairsByCourse(): Promise<CountByCourse[]> {
  const rows = await db.execute<{ course_id: string; value: number }>(sql`
    select l.course_id as course_id, count(*)::int as value
    from (
      select actor_id, lesson_id from academy.lesson_text_completions
      union
      select actor_id, lesson_id from academy.lesson_video_completions
      union
      select actor_id, lesson_id from academy.quiz_attempts where passed = true and invalidated_at is null
    ) x
    join academy.lessons l on l.id = x.lesson_id
    group by l.course_id
  `);
  return (rows.rows ?? rows).map((r) => ({ courseId: r.course_id, value: Number(r.value) }));
}

export async function avgQuizScoreByCourse(): Promise<AvgByCourse[]> {
  const rows = await db
    .select({ courseId: lessons.courseId, avg: sql<number | null>`avg(${quizAttempts.score})` })
    .from(quizAttempts)
    .innerJoin(lessons, eq(lessons.id, quizAttempts.lessonId))
    .where(and(eq(quizAttempts.passed, true), isNull(quizAttempts.invalidatedAt)))
    .groupBy(lessons.courseId);
  return rows.map((r) => ({ courseId: r.courseId, avg: r.avg === null ? null : Number(r.avg) }));
}

export async function countPendingReviewsByCourse(): Promise<CountByCourse[]> {
  const rows = await db
    .select({ courseId: lessons.courseId, value: sql<number>`count(*)::int` })
    .from(lessonActivitySubmissions)
    .innerJoin(lessonActivities, eq(lessonActivities.id, lessonActivitySubmissions.activityId))
    .innerJoin(lessons, eq(lessons.id, lessonActivities.lessonId))
    .where(eq(lessonActivitySubmissions.reviewStatus, "pending"))
    .groupBy(lessons.courseId);
  return rows as CountByCourse[];
}

export async function countActiveStudents(): Promise<number> {
  const [row] = await db
    .select({ value: sql<number>`count(distinct ${enrollments.actorId})::int` })
    .from(enrollments);
  return Number(row?.value ?? 0);
}

export async function findRecentPendingSubmissions(limit: number): Promise<PendingSubmissionRow[]> {
  const rows = await db
    .select({
      submissionId: lessonActivitySubmissions.id,
      actorId: lessonActivitySubmissions.actorId,
      submittedAt: lessonActivitySubmissions.submittedAt,
      activityTitle: lessonActivities.title,
      lessonTitle: lessons.title,
      courseId: courses.id,
      courseTitle: courses.title,
    })
    .from(lessonActivitySubmissions)
    .innerJoin(lessonActivities, eq(lessonActivities.id, lessonActivitySubmissions.activityId))
    .innerJoin(lessons, eq(lessons.id, lessonActivities.lessonId))
    .innerJoin(courses, eq(courses.id, lessons.courseId))
    .where(eq(lessonActivitySubmissions.reviewStatus, "pending"))
    .orderBy(desc(lessonActivitySubmissions.submittedAt))
    .limit(limit);
  return rows as PendingSubmissionRow[];
}
