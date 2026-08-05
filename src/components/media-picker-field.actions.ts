"use server";

import { listCategories, listMediaAssets } from "@/contexts/media";

export type PickableMedia = { id: string; filename: string; url: string; contentType: string };
export type PickableCategory = { id: string; name: string };

// Server action dedicada ao MediaPickerField: o componente é client (precisa reabrir a lista sob
// demanda ao abrir o modal), então não pode importar contexts/media direto — passa por aqui.
export async function listMediaForPickerAction(categoryId?: string): Promise<PickableMedia[]> {
  const result = await listMediaAssets(categoryId ? { categoryId } : {});
  if (!result.success) {
    return [];
  }

  return result.data.map((asset) => ({
    id: asset.id,
    filename: asset.filename,
    url: asset.url,
    contentType: asset.contentType,
  }));
}

export async function listCategoriesForPickerAction(): Promise<PickableCategory[]> {
  const result = await listCategories();
  return result.success ? result.data.map((category) => ({ id: category.id, name: category.name })) : [];
}
