import { getMedia } from "@/contexts/media";
import { beginOperation, endOperation } from "@/observability";
import { invalidateCacheByPrefix } from "../../../../../infrastructure/cache/memory-cache";
import { findEntryById, updateEntryFields } from "./store";
import type { UpdateEntryCommand, UpdateEntryResult } from "./types";

export async function updateEntry(command: UpdateEntryCommand): Promise<UpdateEntryResult> {
  const handle = beginOperation({
    useCase: "cms.update-entry",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findEntryById(command.id);
  if (!existing) {
    const error = { code: "cms.entries.not_found", message: `Entry "${command.id}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  if (command.mediaId) {
    const media = await getMedia({ id: command.mediaId });
    if (!media.success || !media.data) {
      const error = {
        code: "cms.entries.invalid_media",
        message: `Nenhum arquivo de mídia encontrado com id "${command.mediaId}".`,
      };
      endOperation(handle, { success: false, error });
      return { success: false, error };
    }
  }

  const entry = await updateEntryFields(command.id, {
    title: command.title,
    slug: command.slug,
    categoryId: command.categoryId,
    data: command.data,
    mediaId: command.mediaId,
  });

  // Só entry publicada afeta a lista pública — invalidação é responsabilidade de quem escreve
  // (docs/venore-docks.md — Cache).
  if (existing.status === "published") {
    invalidateCacheByPrefix("cms:entries:published");
  }

  endOperation(handle, { success: true });
  return { success: true, data: entry };
}
