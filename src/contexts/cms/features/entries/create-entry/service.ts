import { getMedia } from "@/contexts/media";
import { beginOperation, endOperation } from "@/observability";
import { findEntryByContentTypeAndSlug, insertEntry } from "./store";
import type { CreateEntryCommand, CreateEntryResult } from "./types";

export async function createEntry(command: CreateEntryCommand): Promise<CreateEntryResult> {
  const handle = beginOperation({
    useCase: "cms.create-entry",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findEntryByContentTypeAndSlug(command.contentTypeId, command.slug);
  if (existing) {
    const error = {
      code: "cms.entries.slug_taken",
      message: `Já existe uma entry com o slug "${command.slug}" para esse content type.`,
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

  const entry = await insertEntry({
    contentTypeId: command.contentTypeId,
    categoryId: command.categoryId,
    title: command.title,
    slug: command.slug,
    data: command.data,
    mediaId: command.mediaId,
    authorId: command.actorId,
  });

  // Entry nasce "draft" — não afeta a lista pública de published, sem invalidação de cache aqui.
  endOperation(handle, { success: true });
  return { success: true, data: entry };
}
