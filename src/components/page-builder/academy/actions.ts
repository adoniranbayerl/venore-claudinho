"use server";

import { revalidatePath } from "next/cache";
import { enrollSelf } from "@/plugins/academy";

export type AcademyEnrollActionState = { error: string | null };

export async function academyEnrollAction(
  _prevState: AcademyEnrollActionState,
  formData: FormData,
): Promise<AcademyEnrollActionState> {
  const courseId = String(formData.get("courseId") ?? "");
  const slug = String(formData.get("slug") ?? "");

  const result = await enrollSelf({ courseId });
  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/academy/${slug}`);
  return { error: null };
}
