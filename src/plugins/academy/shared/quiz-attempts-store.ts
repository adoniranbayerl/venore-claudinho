import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { quizAttempts } from "../database/schema";
import type { QuizAttemptRecord } from "../contracts/types";

export async function countActiveAttempts(lessonId: string, actorId: string): Promise<number> {
  const rows = await db
    .select({ id: quizAttempts.id })
    .from(quizAttempts)
    .where(and(eq(quizAttempts.lessonId, lessonId), eq(quizAttempts.actorId, actorId), isNull(quizAttempts.invalidatedAt)));

  return rows.length;
}

export async function hasActivePassingAttempt(lessonId: string, actorId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: quizAttempts.id })
    .from(quizAttempts)
    .where(
      and(
        eq(quizAttempts.lessonId, lessonId),
        eq(quizAttempts.actorId, actorId),
        eq(quizAttempts.passed, true),
        isNull(quizAttempts.invalidatedAt),
      ),
    )
    .limit(1);
  return row !== undefined;
}

export async function findActiveAttempts(lessonId: string, actorId: string): Promise<QuizAttemptRecord[]> {
  const rows = await db
    .select()
    .from(quizAttempts)
    .where(and(eq(quizAttempts.lessonId, lessonId), eq(quizAttempts.actorId, actorId), isNull(quizAttempts.invalidatedAt)));
  return rows as QuizAttemptRecord[];
}

// Reset de professor: invalida em vez de apagar (auditoria). Só afeta tentativas ainda ativas —
// chamar de novo depois de já resetado não invalida nada extra.
export async function invalidateAttempts(lessonId: string, actorId: string): Promise<number> {
  const rows = await db
    .update(quizAttempts)
    .set({ invalidatedAt: new Date() })
    .where(and(eq(quizAttempts.lessonId, lessonId), eq(quizAttempts.actorId, actorId), isNull(quizAttempts.invalidatedAt)))
    .returning({ id: quizAttempts.id });
  return rows.length;
}
