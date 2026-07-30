"use server";

import { revalidatePath } from "next/cache";
import { uploadMedia } from "@/contexts/media";
import { deleteMediaSafely } from "@/platform/media-lifecycle/delete-media-safely";

export type MediaActionState = { error: string | null };

// Mesmo padrão de removeRoleAction (/admin/rbac/actions.ts): erro do handler é devolvido de
// verdade via useActionState, nunca descartado silenciosamente (docs/venore-docks.md).
export async function uploadMediaAction(
  _prevState: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecione um arquivo para enviar." };
  }

  const data = Buffer.from(await file.arrayBuffer());
  const visibility = formData.get("makePublic") === "on" ? "public" : "private";

  const result = await uploadMedia({
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    data,
    visibility,
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/media");
  return { error: null };
}

// Exclusão passa por platform/media-lifecycle/delete-media-safely.ts, não por
// contexts/media.deleteMedia direto — é o ponto de composição que já checa uso em cms antes de
// apagar (docs/venore-docks.md, regra 12/14).
export async function deleteMediaAction(
  _prevState: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  const id = String(formData.get("id") ?? "");
  const result = await deleteMediaSafely({ id });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/media");
  return { error: null };
}
