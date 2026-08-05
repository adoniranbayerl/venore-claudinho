import { countAssetsByCategory, deleteCategoryById, findCategoryById } from "./store";
import type { DeleteCategoryInput, DeleteCategoryResult } from "./types";

// Categoria em uso nunca apaga por cascata silenciosa (docs do pedido: "não é apagada sem tratar
// os assets vinculados") — bloqueia com a contagem, e quem chama decide: desvincular em massa
// (features/categories/clear-category-assets) e tentar de novo, ou recategorizar cada arquivo
// individualmente na biblioteca antes.
export async function deleteCategory(input: DeleteCategoryInput): Promise<DeleteCategoryResult> {
  const existing = await findCategoryById(input.id);
  if (!existing) {
    return {
      success: false,
      error: { code: "media.categories.not_found", message: `Nenhuma categoria encontrada com id "${input.id}".` },
    };
  }

  const filesInUse = await countAssetsByCategory(input.id);
  if (filesInUse > 0) {
    return {
      success: false,
      error: {
        code: "media.categories.in_use",
        message: `Esta categoria está em uso por ${filesInUse} arquivo${filesInUse === 1 ? "" : "s"}. Remova a categoria desses arquivos antes de apagá-la.`,
      },
    };
  }

  await deleteCategoryById(input.id);
  return { success: true, data: { id: input.id } };
}
