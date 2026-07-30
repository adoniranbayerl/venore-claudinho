"use server";

import { revalidatePath } from "next/cache";
import { findUserByEmail } from "@/contexts/auth";
import {
  configureLessonRequirements,
  createLesson,
  enrollStudent,
  publishCourse,
  resetQuizAttempts,
  updateCourseSettings,
} from "@/plugins/academy";

export type CourseActionState = { error: string | null };

// Mesmo padrão de /admin/cms/actions.ts: erro do handler devolvido de verdade via
// useActionState, nunca descartado silenciosamente (docs/venore-docks.md).
export async function createLessonAction(_prevState: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const courseId = String(formData.get("courseId") ?? "");
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();

  const coverMediaId = String(formData.get("coverMediaId") ?? "").trim();

  const result = await createLesson({
    courseId,
    cmsEntryId: String(formData.get("cmsEntryId") ?? ""),
    videoUrl: videoUrl || undefined,
    coverMediaId: coverMediaId || undefined,
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  // Requisitos são opcionais na criação (mesmo padrão de composição de 2 handlers já usado em
  // enrollStudentAction): só chama configureLessonRequirements se o professor marcou algum
  // requisito no form de criação — senão a aula fica sem requisitos, ajustável depois na página
  // da aula (LessonRequirementsForm).
  const quizEnabled = formData.get("quizEnabled") === "on";
  const readTextEnabled = formData.get("readTextEnabled") === "on";
  const watchVideoEnabled = formData.get("watchVideoEnabled") === "on";
  if (readTextEnabled || watchVideoEnabled || quizEnabled) {
    const quizPassThresholdPercent = String(formData.get("quizPassThresholdPercent") ?? "").trim();
    const quizMaxAttempts = String(formData.get("quizMaxAttempts") ?? "").trim();

    const requirementsResult = await configureLessonRequirements({
      lessonId: result.data.id,
      readTextEnabled,
      watchVideoEnabled,
      quizEnabled,
      quizPassThresholdPercent: quizEnabled && quizPassThresholdPercent ? Number(quizPassThresholdPercent) : undefined,
      quizMaxAttempts: quizEnabled && quizMaxAttempts ? Number(quizMaxAttempts) : undefined,
    });

    if (!requirementsResult.success) {
      return { error: requirementsResult.error.message };
    }
  }

  revalidatePath("/admin/academy");
  revalidatePath(`/admin/academy/courses/${courseId}`);
  revalidatePath(`/admin/academy/lessons/${result.data.id}`);
  return { error: null };
}

export async function publishCourseAction(_prevState: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const id = String(formData.get("id") ?? "");

  const result = await publishCourse({ id });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/academy");
  revalidatePath(`/admin/academy/courses/${id}`);
  revalidatePath("/academy");
  revalidatePath(`/academy/${result.data.slug}`);
  return { error: null };
}

export async function updateCourseSettingsAction(
  _prevState: CourseActionState,
  formData: FormData,
): Promise<CourseActionState> {
  const id = String(formData.get("id") ?? "");
  const coverMediaId = String(formData.get("coverMediaId") ?? "").trim();

  const result = await updateCourseSettings({
    id,
    slug: String(formData.get("slug") ?? "") || undefined,
    selfEnrollmentEnabled: formData.get("selfEnrollmentEnabled") === "on",
    publiclyListed: formData.get("publiclyListed") === "on",
    coverMediaId: coverMediaId || null,
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/courses/${id}`);
  revalidatePath("/academy");
  revalidatePath(`/academy/${result.data.slug}`);
  return { error: null };
}

export async function enrollStudentAction(_prevState: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const courseId = String(formData.get("courseId") ?? "");
  const email = String(formData.get("email") ?? "").trim();

  const userResult = await findUserByEmail({ email });
  if (!userResult.success) {
    return { error: userResult.error.message };
  }

  const result = await enrollStudent({ courseId, studentActorId: userResult.data.id });
  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/courses/${courseId}`);
  return { error: null };
}

export async function resetQuizAttemptsAction(
  _prevState: CourseActionState,
  formData: FormData,
): Promise<CourseActionState> {
  const courseId = String(formData.get("courseId") ?? "");
  const lessonId = String(formData.get("lessonId") ?? "");
  const studentActorId = String(formData.get("studentActorId") ?? "");

  const result = await resetQuizAttempts({ lessonId, studentActorId });
  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/academy/courses/${courseId}`);
  return { error: null };
}
