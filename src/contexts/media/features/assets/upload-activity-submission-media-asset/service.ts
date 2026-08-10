import { beginOperation, endOperation } from "@/observability";
import { invalidateCacheByPrefix } from "@/infrastructure/cache/memory-cache";
import { storagePort } from "@/infrastructure/storage";
import { computeSha256Hex } from "@/infrastructure/storage/checksum";
import { getOrCreateReservedCategory } from "../../../get-or-create-reserved-category";
import { ACTIVITY_SUBMISSION_RESERVED_CATEGORY_KEY, ACTIVITY_SUBMISSION_RESERVED_CATEGORY_NAME } from "../../../contracts/types";
import { resolveMediaStorageFolder } from "../../../resolve-media-storage-folder";
import { sanitizeSvgBuffer } from "../../../sanitize-svg-buffer";
import { insertAsset } from "../upload-media-asset/store";
import type { UploadActivitySubmissionMediaAssetCommand, UploadActivitySubmissionMediaAssetResult } from "./types";

const MEDIA_LIST_CACHE_PREFIX = "media:assets:";

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

// Sempre "private" (mesma razão do upload de avatar: o arquivo é do próprio ator, não da
// biblioteca geral) e sempre na categoria reservada "activity-submissions" — nunca escolhida
// pelo chamador. O professor revisando a atividade lê esse asset via
// getMediaAssetForTrustedReview (bypass de visibilidade documentado), não pela leitura escopada
// normal — ver comentário lá.
export async function uploadActivitySubmissionMediaAsset(
  command: UploadActivitySubmissionMediaAssetCommand,
): Promise<UploadActivitySubmissionMediaAssetResult> {
  const handle = beginOperation({
    useCase: "media.upload-activity-submission-media-asset",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const category = await getOrCreateReservedCategory(
    ACTIVITY_SUBMISSION_RESERVED_CATEGORY_KEY,
    ACTIVITY_SUBMISSION_RESERVED_CATEGORY_NAME,
  );

  // SVG pode carregar script embutido — sanitiza antes de gravar (mesmo motivo de
  // upload-media-asset/service.ts).
  let dataToStore = command.data;
  if (command.contentType === "image/svg+xml") {
    const sanitized = sanitizeSvgBuffer(command.data);
    if (!sanitized.success) {
      endOperation(handle, sanitized);
      return sanitized;
    }
    dataToStore = sanitized.data;
  }

  const pathname = `${resolveMediaStorageFolder(command.contentType)}/${crypto.randomUUID()}-${sanitizeFilename(command.filename)}`;
  const stored = await storagePort.store({ key: pathname, data: dataToStore, contentType: command.contentType });
  const checksum = computeSha256Hex(dataToStore);

  const asset = await insertAsset({
    filename: command.filename,
    pathname: stored.key,
    url: stored.url,
    contentType: command.contentType,
    size: stored.size,
    checksum,
    visibility: "private",
    categoryId: category.id,
    uploadedBy: command.actorId,
  });

  invalidateCacheByPrefix(MEDIA_LIST_CACHE_PREFIX);
  endOperation(handle, { success: true });
  return { success: true, data: asset };
}
