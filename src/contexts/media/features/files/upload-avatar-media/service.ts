import { beginOperation, endOperation } from "@/observability";
import { invalidateCacheByPrefix } from "@/infrastructure/cache/memory-cache";
import { storageAdapter } from "@/infrastructure/storage";
import { insertAvatarMediaFile } from "./store";
import type { UploadAvatarMediaCommand, UploadAvatarMediaResult } from "./types";

const MEDIA_LIST_CACHE_PREFIX = "media:files:";

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

// Sempre "private": diferente de upload-media (biblioteca, gated a media.manage), este use case
// é aberto a qualquer ator autenticado pra enviar a própria imagem de avatar — nunca aceita
// visibility do chamador, então nunca pode nascer público (é exatamente o bug que este contexto
// corrigiu antes: mídia de avatar vazando pra biblioteca de todo mundo).
export async function uploadAvatarMedia(command: UploadAvatarMediaCommand): Promise<UploadAvatarMediaResult> {
  const handle = beginOperation({
    useCase: "media.upload-avatar-media",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const storageKey = `${crypto.randomUUID()}-${sanitizeFilename(command.filename)}`;
  const { url } = await storageAdapter.put({ key: storageKey, data: command.data, mimeType: command.mimeType });

  const media = await insertAvatarMediaFile({
    filename: command.filename,
    storageKey,
    mimeType: command.mimeType,
    size: command.size,
    url,
    uploadedBy: command.actorId,
    visibility: "private",
  });

  invalidateCacheByPrefix(MEDIA_LIST_CACHE_PREFIX);
  endOperation(handle, { success: true });
  return { success: true, data: media };
}
