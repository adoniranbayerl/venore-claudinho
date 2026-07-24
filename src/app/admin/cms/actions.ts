"use server";

import { revalidatePath } from "next/cache";
import { createCategory, createContentType, publishEntry } from "@/contexts/cms";

export type CmsActionState = { error: string | null };

// Toda ação de escrita do CMS devolve o erro de verdade do handler via useActionState, em vez de
// descartá-lo silenciosamente (docs/venore-docks.md — mesmo conserto do bug do superadmin em
// /admin/rbac/actions.ts: removeRoleAction).
export async function createContentTypeAction(
  _prevState: CmsActionState,
  formData: FormData,
): Promise<CmsActionState> {
  const result = await createContentType({
    key: String(formData.get("key") ?? ""),
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? "") || undefined,
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/cms");
  return { error: null };
}

export async function createCategoryAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const result = await createCategory({
    key: String(formData.get("key") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? "") || undefined,
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/cms");
  return { error: null };
}

export async function publishEntryAction(_prevState: CmsActionState, formData: FormData): Promise<CmsActionState> {
  const result = await publishEntry({ id: String(formData.get("id") ?? "") });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/cms");
  return { error: null };
}
