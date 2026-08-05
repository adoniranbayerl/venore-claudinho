import { invalidateCacheByPrefix } from "@/infrastructure/cache/memory-cache";
import { findAssetById, findCategoryById, updateCategoryOnAsset } from "./store";
import type { UpdateMediaAssetCategoryCommand, UpdateMediaAssetCategoryResult } from "./types";

const MEDIA_LIST_CACHE_PREFIX = "media:assets:";

export async function updateMediaAssetCategory(command: UpdateMediaAssetCategoryCommand): Promise<UpdateMediaAssetCategoryResult> {
  const media = await findAssetById(command.id);
  const canEdit = media !== null && (command.isMediaAdmin || media.uploadedBy === command.actorId);

  if (!canEdit) {
    return {
      success: false,
      error: { code: "media.not_found", message: `Nenhum arquivo de mídia encontrado com id "${command.id}".` },
    };
  }

  if (command.categoryId !== null) {
    const category = await findCategoryById(command.categoryId);
    if (!category) {
      return {
        success: false,
        error: { code: "media.categories.not_found", message: `Nenhuma categoria encontrada com id "${command.categoryId}".` },
      };
    }
  }

  const updated = await updateCategoryOnAsset(command.id, command.categoryId);
  invalidateCacheByPrefix(MEDIA_LIST_CACHE_PREFIX);

  return { success: true, data: updated };
}
