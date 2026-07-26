"use server";

import { revalidatePath } from "next/cache";
import { enrollSelf } from "@/plugins/academy";

export type EnrollSelfActionState = { error: string | null };

export async function enrollSelfAction(
  _prevState: EnrollSelfActionState,
  formData: FormData,
): Promise<EnrollSelfActionState> {
  const courseId = String(formData.get("courseId") ?? "");
  const courseSlug = String(formData.get("courseSlug") ?? "");

  const result = await enrollSelf({ courseId });
  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath(`/academy/${courseSlug}`);
  revalidatePath("/academy");
  return { error: null };
}
