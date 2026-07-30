import { invalidateCacheByPrefix } from "@/infrastructure/cache/memory-cache";
import { clearCategoryFromFiles } from "./store";
import type { ClearCategoryAssetsInput, ClearCategoryAssetsResult } from "./types";

const MEDIA_LIST_CACHE_PREFIX = "media:files:";

// Passo explícito antes de apagar uma categoria em uso — nunca disparado como efeito colateral de
// deleteCategory (docs do pedido: "trata os assets vinculados" é uma ação deliberada, não uma
// cascata escondida).
export async function clearCategoryAssets(input: ClearCategoryAssetsInput): Promise<ClearCategoryAssetsResult> {
  const clearedCount = await clearCategoryFromFiles(input.categoryId);
  invalidateCacheByPrefix(MEDIA_LIST_CACHE_PREFIX);
  return { success: true, data: { clearedCount } };
}
