import { beginOperation, endOperation } from "@/observability";
import { invalidateCache } from "@/infrastructure/cache/memory-cache";
import { storageAdapter } from "@/infrastructure/storage";
import { insertMediaFile } from "./store";
import type { UploadMediaCommand, UploadMediaResult } from "./types";

const MEDIA_LIST_CACHE_KEY = "media:files";

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

export async function uploadMedia(command: UploadMediaCommand): Promise<UploadMediaResult> {
  const handle = beginOperation({
    useCase: "media.upload-media",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const storageKey = `${crypto.randomUUID()}-${sanitizeFilename(command.filename)}`;
  const { url } = await storageAdapter.put({ key: storageKey, data: command.data, mimeType: command.mimeType });

  const media = await insertMediaFile({
    filename: command.filename,
    storageKey,
    mimeType: command.mimeType,
    size: command.size,
    url,
    uploadedBy: command.actorId,
  });

  invalidateCache(MEDIA_LIST_CACHE_KEY);
  endOperation(handle, { success: true });
  return { success: true, data: media };
}
