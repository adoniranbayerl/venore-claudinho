"use server";

import { revalidatePath } from "next/cache";
import { markTextRead, markVideoWatched, submitQuizAttempt } from "@/plugins/academy";

export type LessonActionState = { error: string | null };

function revalidateLesson(courseSlug: string, lessonId: string) {
  revalidatePath(`/academy/${courseSlug}`);
  revalidatePath(`/academy/${courseSlug}/${lessonId}`);
}

export async function markTextReadAction(_prevState: LessonActionState, formData: FormData): Promise<LessonActionState> {
  const lessonId = String(formData.get("lessonId") ?? "");
  const courseSlug = String(formData.get("courseSlug") ?? "");

  const result = await markTextRead({ lessonId });
  if (!result.success) {
    return { error: result.error.message };
  }

  revalidateLesson(courseSlug, lessonId);
  return { error: null };
}

export async function markVideoWatchedAction(
  _prevState: LessonActionState,
  formData: FormData,
): Promise<LessonActionState> {
  const lessonId = String(formData.get("lessonId") ?? "");
  const courseSlug = String(formData.get("courseSlug") ?? "");

  const result = await markVideoWatched({ lessonId });
  if (!result.success) {
    return { error: result.error.message };
  }

  revalidateLesson(courseSlug, lessonId);
  return { error: null };
}

export type QuizActionState = {
  error: string | null;
  result: { attemptNumber: number; score: number; passed: boolean; attemptsRemaining: number } | null;
};

export async function submitQuizAction(_prevState: QuizActionState, formData: FormData): Promise<QuizActionState> {
  const lessonId = String(formData.get("lessonId") ?? "");
  const courseSlug = String(formData.get("courseSlug") ?? "");
  const questionIds = formData.getAll("questionId").map((value) => String(value));

  const answers = questionIds.map((questionId) => ({
    questionId,
    selectedOptionIndex: Number(formData.get(`answer-${questionId}`) ?? -1),
  }));

  const result = await submitQuizAttempt({ lessonId, answers });
  if (!result.success) {
    return { error: result.error.message, result: null };
  }

  revalidateLesson(courseSlug, lessonId);
  return { error: null, result: result.data };
}
