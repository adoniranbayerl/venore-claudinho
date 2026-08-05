import { invalidateCacheByPrefix } from "@/infrastructure/cache/memory-cache";
import { findAssetById, updateAssetVisibility } from "./store";
import type { UpdateMediaAssetVisibilityCommand, UpdateMediaAssetVisibilityResult } from "./types";

const MEDIA_LIST_CACHE_PREFIX = "media:assets:";

// "Não encontrado" cobre tanto arquivo inexistente quanto ator sem direito de editar (nem dono,
// nem media.manage) — nunca confirma pra quem pergunta que um asset privado de outro ator existe.
export async function updateMediaAssetVisibility(command: UpdateMediaAssetVisibilityCommand): Promise<UpdateMediaAssetVisibilityResult> {
  const media = await findAssetById(command.id);
  const canEdit = media !== null && (command.isMediaAdmin || media.uploadedBy === command.actorId);

  if (!canEdit) {
    return {
      success: false,
      error: { code: "media.not_found", message: `Nenhum arquivo de mídia encontrado com id "${command.id}".` },
    };
  }

  const updated = await updateAssetVisibility(command.id, command.visibility);
  invalidateCacheByPrefix(MEDIA_LIST_CACHE_PREFIX);

  return { success: true, data: updated };
}
