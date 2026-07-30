import { invalidateCacheByPrefix } from "@/infrastructure/cache/memory-cache";
import { findCategoryById, findMediaById, updateCategoryOnFile } from "./store";
import type { UpdateMediaCategoryCommand, UpdateMediaCategoryResult } from "./types";

const MEDIA_LIST_CACHE_PREFIX = "media:files:";

// Mesma regra de "não encontrado" cobrindo falta de permissão de update-media-visibility/service.ts
// — não vaza a existência de um arquivo privado alheio.
export async function updateMediaCategory(command: UpdateMediaCategoryCommand): Promise<UpdateMediaCategoryResult> {
  const media = await findMediaById(command.id);
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

  const updated = await updateCategoryOnFile(command.id, command.categoryId);
  invalidateCacheByPrefix(MEDIA_LIST_CACHE_PREFIX);

  return { success: true, data: updated };
}
