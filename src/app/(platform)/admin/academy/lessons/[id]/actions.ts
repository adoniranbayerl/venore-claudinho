"use server";

import { revalidatePath } from "next/cache";
import { addQuizQuestion, configureLessonRequirements, updateLesson } from "@/plugins/academy";

export type LessonActionState = { error: string | null };

// Mesmo padrão de /admin/cms/actions.ts: erro do handler devolvido de verdade via
// useActionState, nunca descartado silenciosamente (docs/venore-docks.md).
export async function updateLessonCoverAction(_prevState: LessonActionState, formData: FormData): Promise<LessonActionState> {
  const lessonId = String(formData.get("lessonId") ?? "");
  const coverMediaId = String(formData.get("coverMediaId") ?? "").trim();

  const result = await updateLesson({ id: lessonId, coverMediaId: coverMediaId || null });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/lessons/${lessonId}`);
  return { error: null };
}

// Mesmo padrão de /admin/cms/actions.ts: erro do handler devolvido de verdade via
// useActionState, nunca descartado silenciosamente (docs/venore-docks.md).
export async function configureLessonRequirementsAction(
  _prevState: LessonActionState,
  formData: FormData,
): Promise<LessonActionState> {
  const lessonId = String(formData.get("lessonId") ?? "");
  const quizEnabled = formData.get("quizEnabled") === "on";
  const quizPassThresholdPercent = String(formData.get("quizPassThresholdPercent") ?? "").trim();
  const quizMaxAttempts = String(formData.get("quizMaxAttempts") ?? "").trim();

  const result = await configureLessonRequirements({
    lessonId,
    readTextEnabled: formData.get("readTextEnabled") === "on",
    watchVideoEnabled: formData.get("watchVideoEnabled") === "on",
    quizEnabled,
    quizPassThresholdPercent: quizEnabled && quizPassThresholdPercent ? Number(quizPassThresholdPercent) : undefined,
    quizMaxAttempts: quizEnabled && quizMaxAttempts ? Number(quizMaxAttempts) : undefined,
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/lessons/${lessonId}`);
  return { error: null };
}

export async function addQuizQuestionAction(_prevState: LessonActionState, formData: FormData): Promise<LessonActionState> {
  const lessonId = String(formData.get("lessonId") ?? "");
  const options = formData.getAll("options").map((option) => String(option).trim()).filter((option) => option.length > 0);
  const correctOptionIndex = Number(formData.get("correctOptionIndex") ?? "-1");

  const result = await addQuizQuestion({
    lessonId,
    text: String(formData.get("text") ?? ""),
    options,
    correctOptionIndex,
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/lessons/${lessonId}`);
  return { error: null };
}
