"use server";

import { listCategories, listMedia } from "@/contexts/media";

export type PickableMedia = { id: string; filename: string; url: string; mimeType: string };
export type PickableCategory = { id: string; name: string };

// Server action dedicada ao MediaPickerField: o componente é client (precisa reabrir a lista sob
// demanda ao abrir o modal), então não pode importar contexts/media direto — passa por aqui.
export async function listMediaForPickerAction(categoryId?: string): Promise<PickableMedia[]> {
  const result = await listMedia(categoryId ? { categoryId } : {});
  if (!result.success) {
    return [];
  }

  return result.data.map((file) => ({
    id: file.id,
    filename: file.filename,
    url: file.url,
    mimeType: file.mimeType,
  }));
}

export async function listCategoriesForPickerAction(): Promise<PickableCategory[]> {
  const result = await listCategories();
  return result.success ? result.data.map((category) => ({ id: category.id, name: category.name })) : [];
}
