"use server";

import { revalidatePath } from "next/cache";
import { createCourse } from "@/plugins/academy";

export type AcademyActionState = { error: string | null };

// Mesmo padrão de /admin/cms/actions.ts: erro do handler devolvido de verdade via
// useActionState, nunca descartado silenciosamente (docs/venore-docks.md).
export async function createCourseAction(_prevState: AcademyActionState, formData: FormData): Promise<AcademyActionState> {
  const result = await createCourse({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? "") || undefined,
    selfEnrollmentEnabled: formData.get("selfEnrollmentEnabled") === "on",
    publiclyListed: formData.get("publiclyListed") === "on",
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/academy");
  return { error: null };
}
