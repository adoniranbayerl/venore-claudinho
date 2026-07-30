import { beginOperation, endOperation } from "@/observability";
import { invalidateCacheByPrefix } from "@/infrastructure/cache/memory-cache";
import { storageAdapter } from "@/infrastructure/storage";
import { deleteMediaById, findMediaById } from "./store";
import type { DeleteMediaCommand, DeleteMediaResult } from "./types";

const MEDIA_LIST_CACHE_PREFIX = "media:files:";

export async function deleteMedia(command: DeleteMediaCommand): Promise<DeleteMediaResult> {
  const handle = beginOperation({
    useCase: "media.delete-media",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const media = await findMediaById(command.id);
  if (!media) {
    const error = { code: "media.not_found", message: `Nenhum arquivo de mídia encontrado com id "${command.id}".` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  await storageAdapter.delete(media.storageKey);
  await deleteMediaById(command.id);

  invalidateCacheByPrefix(MEDIA_LIST_CACHE_PREFIX);
  endOperation(handle, { success: true });
  return { success: true, data: { id: command.id } };
}
