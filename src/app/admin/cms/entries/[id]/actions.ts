"use server";

import { revalidatePath } from "next/cache";
import { publishEntry, updateEntry } from "@/contexts/cms";

export type EditEntryActionState = { error: string | null };

// Mesmo padrão de removeRoleAction (/admin/rbac/actions.ts): erro do handler é devolvido de
// verdade via useActionState, nunca descartado silenciosamente (docs/venore-docks.md).
export async function updateEntryAction(
  _prevState: EditEntryActionState,
  formData: FormData,
): Promise<EditEntryActionState> {
  const id = String(formData.get("id") ?? "");
  const mediaId = String(formData.get("mediaId") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const body = String(formData.get("body") ?? "");

  const result = await updateEntry({
    id,
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    categoryId: categoryId || null,
    data: { body },
    mediaId: mediaId || null,
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/cms");
  revalidatePath(`/admin/cms/entries/${id}`);
  return { error: null };
}

export async function publishEntryFromEditAction(
  _prevState: EditEntryActionState,
  formData: FormData,
): Promise<EditEntryActionState> {
  const id = String(formData.get("id") ?? "");
  const result = await publishEntry({ id });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/cms");
  revalidatePath(`/admin/cms/entries/${id}`);
  return { error: null };
}
