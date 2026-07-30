import { getMedia } from "@/contexts/media";
import { beginOperation, endOperation } from "@/observability";
import { invalidateCacheByPrefix } from "../../../../../infrastructure/cache/memory-cache";
import { findEntryById, findOtherEntryByCategoryAndSlug, updateEntryFields } from "./store";
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

  const effectiveCategoryId = command.categoryId !== undefined ? command.categoryId : existing.categoryId;
  const effectiveSlug = command.slug ?? existing.slug;

  const duplicate = await findOtherEntryByCategoryAndSlug(command.id, effectiveCategoryId, effectiveSlug);
  if (duplicate) {
    const error = {
      code: "cms.entries.slug_taken",
      message: effectiveCategoryId
        ? `Já existe uma entry com o slug "${effectiveSlug}" nessa categoria.`
        : `Já existe uma entry sem categoria com o slug "${effectiveSlug}".`,
    };
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
  // (docs/venore-docks.md — Cache). slug/categoryId mudam o href resolvido de qualquer item de
  // menu "content" que aponte pra esta entry — gatilho de invalidação da navegação (regra:
  // alteração de endereço de conteúdo referenciado invalida cache de menu).
  if (existing.status === "published") {
    invalidateCacheByPrefix("cms:entries:published");
    invalidateCacheByPrefix("cms:navigation");
  }

  endOperation(handle, { success: true });
  return { success: true, data: entry };
}
