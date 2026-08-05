"use server";

import { revalidatePath } from "next/cache";
import { purgeMediaSafely } from "@/platform/media-lifecycle/purge-media-safely";

export type MediaTrashActionState = { error: string | null };

// Mesmo padrão de deleteMediaAction (/admin/media/actions.ts): erro do handler é devolvido de
// verdade via useActionState, nunca descartado silenciosamente (docs/venore-docks.md).
export async function purgeMediaAction(
  _prevState: MediaTrashActionState,
  formData: FormData,
): Promise<MediaTrashActionState> {
  const id = String(formData.get("id") ?? "");
  const result = await purgeMediaSafely({ id });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/media/trash");
  return { error: null };
}
