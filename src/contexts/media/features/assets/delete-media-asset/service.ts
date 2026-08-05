import { invalidateCacheByPrefix } from "@/infrastructure/cache/memory-cache";
import { beginOperation, endOperation } from "@/observability";
import { findAssetById, softDeleteAssetById } from "./store";
import type { DeleteMediaAssetCommand, DeleteMediaAssetResult } from "./types";

const MEDIA_LIST_CACHE_PREFIX = "media:assets:";

// Soft delete (blob-spec seção 7): seta `deletedAt`, nunca chama storagePort.remove aqui — o
// blob e a linha continuam existindo até o sweep de purge (fora do escopo desta sessão).
export async function deleteMediaAsset(command: DeleteMediaAssetCommand): Promise<DeleteMediaAssetResult> {
  const handle = beginOperation({
    useCase: "media.delete-media-asset",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const asset = await findAssetById(command.id);
  if (!asset) {
    const error = { code: "media.not_found", message: `Nenhum asset de mídia encontrado com id "${command.id}".` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  if (!asset.deletedAt) {
    await softDeleteAssetById(command.id);
    invalidateCacheByPrefix(MEDIA_LIST_CACHE_PREFIX);
  }

  endOperation(handle, { success: true });
  return { success: true, data: { id: command.id } };
}
