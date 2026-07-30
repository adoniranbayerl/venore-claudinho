"use server";

import { revalidatePath } from "next/cache";
import { updateOwnAvatar } from "@/contexts/auth";
import { uploadAvatarMedia } from "@/contexts/media";

export type AccountActionState = { error: string | null };

// Mesmo padrão de /admin/cms/actions.ts: erro do handler devolvido de verdade via
// useActionState, nunca descartado silenciosamente (docs/venore-docks.md).
export async function updateOwnAvatarAction(_prevState: AccountActionState, formData: FormData): Promise<AccountActionState> {
  const avatarMediaId = String(formData.get("avatarMediaId") ?? "").trim();

  const result = await updateOwnAvatar({ avatarMediaId: avatarMediaId || null });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/account");
  return { error: null };
}

// Envia a imagem (upload-avatar-media: qualquer ator autenticado, sempre privada, < 500KB) e já
// aplica como avatar do próprio ator — um só passo, não passa pelo picker da biblioteca geral.
export async function uploadAvatarAction(_prevState: AccountActionState, formData: FormData): Promise<AccountActionState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecione uma imagem para enviar." };
  }

  const data = Buffer.from(await file.arrayBuffer());

  const uploadResult = await uploadAvatarMedia({
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    data,
  });

  if (!uploadResult.success) {
    return { error: uploadResult.error.message };
  }

  const avatarResult = await updateOwnAvatar({ avatarMediaId: uploadResult.data.id });
  if (!avatarResult.success) {
    return { error: avatarResult.error.message };
  }

  revalidatePath("/account");
  return { error: null };
}
