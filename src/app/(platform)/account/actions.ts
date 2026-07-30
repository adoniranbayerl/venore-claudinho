"use server";

import { revalidatePath } from "next/cache";
import { updateOwnAvatar } from "@/contexts/auth";

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
