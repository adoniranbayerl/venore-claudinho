import { invalidateCacheByPrefix } from "@/infrastructure/cache/memory-cache";
import { findMediaById, updateVisibility } from "./store";
import type { UpdateMediaVisibilityCommand, UpdateMediaVisibilityResult } from "./types";

const MEDIA_LIST_CACHE_PREFIX = "media:files:";

// "Não encontrado" cobre tanto o caso real de arquivo inexistente quanto o de um ator sem
// direito de editar este arquivo (nem dono, nem media.manage) — mesmo raciocínio de
// get-media/store.ts: nunca confirma pra quem pergunta que um arquivo privado de outro ator
// existe, nem por meio de uma mensagem de "sem permissão" diferente de "não encontrado".
export async function updateMediaVisibility(command: UpdateMediaVisibilityCommand): Promise<UpdateMediaVisibilityResult> {
  const media = await findMediaById(command.id);
  const canEdit = media !== null && (command.isMediaAdmin || media.uploadedBy === command.actorId);

  if (!canEdit) {
    return {
      success: false,
      error: { code: "media.not_found", message: `Nenhum arquivo de mídia encontrado com id "${command.id}".` },
    };
  }

  const updated = await updateVisibility(command.id, command.visibility);
  invalidateCacheByPrefix(MEDIA_LIST_CACHE_PREFIX);

  return { success: true, data: updated };
}
