import { beginOperation, endOperation } from "@/observability";
import { invalidateCacheByPrefix } from "@/infrastructure/cache/memory-cache";
import { storagePort } from "@/infrastructure/storage";
import { computeSha256Hex } from "@/infrastructure/storage/checksum";
import { getOrCreateReservedCategory } from "../../../get-or-create-reserved-category";
import { AVATAR_RESERVED_CATEGORY_KEY, AVATAR_RESERVED_CATEGORY_NAME } from "../../../contracts/types";
import { resolveMediaStorageFolder } from "../../../resolve-media-storage-folder";
import { insertAsset } from "../upload-media-asset/store";
import type { UploadAvatarMediaAssetCommand, UploadAvatarMediaAssetResult } from "./types";

const MEDIA_LIST_CACHE_PREFIX = "media:assets:";

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

// Sempre "private" (nunca aceita visibility do chamador — mesma correção de vazamento de avatar
// já documentada em upload-avatar-media) e sempre na categoria reservada "avatars" (Fase 4/M1 —
// primeiro caso concreto de pasta de sistema, atribuída automaticamente, não escolhida pelo
// usuário).
export async function uploadAvatarMediaAsset(command: UploadAvatarMediaAssetCommand): Promise<UploadAvatarMediaAssetResult> {
  const handle = beginOperation({
    useCase: "media.upload-avatar-media-asset",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const avatarsCategory = await getOrCreateReservedCategory(AVATAR_RESERVED_CATEGORY_KEY, AVATAR_RESERVED_CATEGORY_NAME);

  const pathname = `${resolveMediaStorageFolder(command.contentType)}/${crypto.randomUUID()}-${sanitizeFilename(command.filename)}`;
  const stored = await storagePort.store({ key: pathname, data: command.data, contentType: command.contentType });
  const checksum = computeSha256Hex(command.data);

  const asset = await insertAsset({
    filename: command.filename,
    pathname: stored.key,
    url: stored.url,
    contentType: command.contentType,
    size: stored.size,
    checksum,
    visibility: "private",
    categoryId: avatarsCategory.id,
    uploadedBy: command.actorId,
  });

  invalidateCacheByPrefix(MEDIA_LIST_CACHE_PREFIX);
  endOperation(handle, { success: true });
  return { success: true, data: asset };
}
