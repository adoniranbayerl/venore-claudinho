import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { lessonRequirements, lessonTextCompletions, lessonVideoCompletions, lessons, quizAttempts } from "../database/schema";
import type { LessonRecord, LessonRequirementsRecord, QuizAttemptRecord } from "../contracts/types";

export type LessonChainRawData = {
  lessons: LessonRecord[];
  requirementsByLessonId: Map<string, LessonRequirementsRecord | null>;
  textCompletedLessonIds: Set<string>;
  videoCompletedLessonIds: Set<string>;
  attemptsByLessonId: Map<string, QuizAttemptRecord[]>;
};

// Conjunto fixo de queries: 1 pra pegar as aulas do curso + 4 em paralelo filtradas por
// lessonId IN (...) — sempre 5 queries, independente de quantas aulas o curso tem ou da posição
// da aula sendo autorizada. Antes, isLessonAccessible fazia round-trip sequencial por aula
// (~4 queries * posição da aula).
export async function loadLessonChainRawData(courseId: string, actorId: string): Promise<LessonChainRawData> {
  const lessonRows = (await db.select().from(lessons).where(eq(lessons.courseId, courseId)).orderBy(lessons.position)) as LessonRecord[];

  if (lessonRows.length === 0) {
    return {
      lessons: [],
      requirementsByLessonId: new Map(),
      textCompletedLessonIds: new Set(),
      videoCompletedLessonIds: new Set(),
      attemptsByLessonId: new Map(),
    };
  }

  const lessonIds = lessonRows.map((lesson) => lesson.id);

  const [requirementRows, textRows, videoRows, attemptRows] = await Promise.all([
    db.select().from(lessonRequirements).where(inArray(lessonRequirements.lessonId, lessonIds)),
    db
      .select({ lessonId: lessonTextCompletions.lessonId })
      .from(lessonTextCompletions)
      .where(and(inArray(lessonTextCompletions.lessonId, lessonIds), eq(lessonTextCompletions.actorId, actorId))),
    db
      .select({ lessonId: lessonVideoCompletions.lessonId })
      .from(lessonVideoCompletions)
      .where(and(inArray(lessonVideoCompletions.lessonId, lessonIds), eq(lessonVideoCompletions.actorId, actorId))),
    db
      .select()
      .from(quizAttempts)
      .where(and(inArray(quizAttempts.lessonId, lessonIds), eq(quizAttempts.actorId, actorId), isNull(quizAttempts.invalidatedAt))),
  ]);

  const requirementsByLessonId = new Map<string, LessonRequirementsRecord | null>(lessonIds.map((id) => [id, null]));
  for (const row of requirementRows as LessonRequirementsRecord[]) {
    requirementsByLessonId.set(row.lessonId, row);
  }

  const attemptsByLessonId = new Map<string, QuizAttemptRecord[]>();
  for (const attempt of attemptRows as QuizAttemptRecord[]) {
    const existing = attemptsByLessonId.get(attempt.lessonId) ?? [];
    existing.push(attempt);
    attemptsByLessonId.set(attempt.lessonId, existing);
  }

  return {
    lessons: lessonRows,
    requirementsByLessonId,
    textCompletedLessonIds: new Set(textRows.map((row) => row.lessonId)),
    videoCompletedLessonIds: new Set(videoRows.map((row) => row.lessonId)),
    attemptsByLessonId,
  };
}
