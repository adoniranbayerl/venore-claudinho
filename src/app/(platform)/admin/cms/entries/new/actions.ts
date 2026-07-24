"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createEntry } from "@/contexts/cms";

export type CreateEntryActionState = { error: string | null };

// Mesmo padrão de removeRoleAction (/admin/rbac/actions.ts): erro do handler é devolvido de
// verdade via useActionState, nunca descartado silenciosamente (docs/venore-docks.md).
export async function createEntryAction(
  _prevState: CreateEntryActionState,
  formData: FormData,
): Promise<CreateEntryActionState> {
  const mediaId = String(formData.get("mediaId") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const body = String(formData.get("body") ?? "");

  const result = await createEntry({
    contentTypeId: String(formData.get("contentTypeId") ?? ""),
    categoryId: categoryId || undefined,
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    data: { body },
    mediaId: mediaId || undefined,
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/cms");
  redirect("/admin/cms");
}
