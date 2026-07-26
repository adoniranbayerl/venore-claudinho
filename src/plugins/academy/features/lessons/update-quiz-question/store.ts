import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { quizQuestions } from "../../../database/schema";
import type { QuizQuestionRecord } from "../../../contracts/types";

export async function findQuizQuestionById(id: string): Promise<QuizQuestionRecord | null> {
  const [row] = await db.select().from(quizQuestions).where(eq(quizQuestions.id, id)).limit(1);
  return (row as QuizQuestionRecord) ?? null;
}

export async function updateQuizQuestion(
  id: string,
  input: { text?: string; options?: string[]; correctOptionIndex?: number },
): Promise<QuizQuestionRecord> {
  const [row] = await db.update(quizQuestions).set(input).where(eq(quizQuestions.id, id)).returning();
  return row as QuizQuestionRecord;
}
