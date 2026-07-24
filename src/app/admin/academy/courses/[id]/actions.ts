"use server";

import { revalidatePath } from "next/cache";
import { createLesson, publishCourse } from "@/plugins/academy";

export type CourseActionState = { error: string | null };

// Mesmo padrão de /admin/cms/actions.ts: erro do handler devolvido de verdade via
// useActionState, nunca descartado silenciosamente (docs/venore-docks.md).
export async function createLessonAction(_prevState: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const courseId = String(formData.get("courseId") ?? "");
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();

  const result = await createLesson({
    courseId,
    cmsEntryId: String(formData.get("cmsEntryId") ?? ""),
    videoUrl: videoUrl || undefined,
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/academy");
  revalidatePath(`/admin/academy/courses/${courseId}`);
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
  revalidatePath(`/academy/${id}`);
  return { error: null };
}
