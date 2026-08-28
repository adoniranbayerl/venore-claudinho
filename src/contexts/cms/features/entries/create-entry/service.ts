import { getMediaAsset } from "@/contexts/media";
import { beginOperation, endOperation } from "@/observability";
import { invalidateCache } from "../../../../../infrastructure/cache/memory-cache";
import { assertCmsCategoryScope } from "../../../shared/scoped-authorization";
import { findEntryByCategoryAndSlug, insertEntry } from "./store";
import type { CreateEntryCommand, CreateEntryResult } from "./types";

export async function createEntry(command: CreateEntryCommand): Promise<CreateEntryResult> {
  const handle = beginOperation({
    useCase: "cms.create-entry",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  // Fase C: um editor/author escopado só cria dentro das suas categorias; entry sem categoria
  // exige a permission global (docs/rbac-scoped-roles.md §4.4).
  const scope = await assertCmsCategoryScope(command.actorId, ["cms.entries.manage"], command.categoryId ?? null);
  if (!scope.success) {
    endOperation(handle, { success: false, error: scope.error });
    return { success: false, error: scope.error };
  }

  const existing = await findEntryByCategoryAndSlug(command.categoryId ?? null, command.slug);
  if (existing) {
    const error = {
      code: "cms.entries.slug_taken",
      message: command.categoryId
        ? `Já existe uma entry com o slug "${command.slug}" nessa categoria.`
        : `Já existe uma entry sem categoria com o slug "${command.slug}".`,
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  if (command.mediaId) {
    const media = await getMediaAsset({ id: command.mediaId });
    if (!media.success || !media.data) {
      const error = {
        code: "cms.entries.invalid_media",
        message: `Nenhum arquivo de mídia encontrado com id "${command.mediaId}".`,
      };
      endOperation(handle, { success: false, error });
      return { success: false, error };
    }
  }

  const entry = await insertEntry({
    contentTypeIds: command.contentTypeIds,
    categoryId: command.categoryId,
    title: command.title,
    slug: command.slug,
    visibility: command.visibility,
    data: command.data,
    mediaId: command.mediaId,
    internalOwner: command.internalOwner,
    authorId: command.actorId,
  });

  // Entry nasce "draft" — não afeta a lista pública de published. listContentTypes cacheia
  // entryCount por tag (Fase 3/C8) junto do catálogo, então toda entry nova precisa invalidar
  // essa chave mesmo sem publicar nada (docs/venore-docks.md — Cache).
  invalidateCache("cms:content-types");

  endOperation(handle, { success: true });
  return { success: true, data: entry };
}
