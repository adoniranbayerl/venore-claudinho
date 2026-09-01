import { beginOperation, endOperation } from "@/observability";
import { invalidateCacheByPrefix } from "@/infrastructure/cache/memory-cache";
import { storagePort } from "@/infrastructure/storage";
import { computeSha256Hex } from "@/infrastructure/storage/checksum";
import { getOrCreateReservedCategory } from "../../../get-or-create-reserved-category";
import { TICKET_ATTACHMENT_RESERVED_CATEGORY_KEY, TICKET_ATTACHMENT_RESERVED_CATEGORY_NAME } from "../../../contracts/types";
import { resolveMediaStorageFolder } from "../../../resolve-media-storage-folder";
import { sanitizeSvgBuffer } from "../../../sanitize-svg-buffer";
import { insertAsset } from "../upload-media-asset/store";
import type { UploadTicketAttachmentMediaAssetCommand, UploadTicketAttachmentMediaAssetResult } from "./types";

const MEDIA_LIST_CACHE_PREFIX = "media:assets:";

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

// Sempre "private" (o anexo é do chamado, não da biblioteca geral) e sempre na categoria
// reservada "ticket-attachments" — nunca escolhida pelo chamador. Espelha
// uploadActivitySubmissionMediaAsset do academy: a equipe da fila lê o asset via
// getMediaAssetForTrustedReview depois que o service do helpdesk já autorizou o acesso ao
// chamado, não pela leitura escopada normal.
export async function uploadTicketAttachmentMediaAsset(
  command: UploadTicketAttachmentMediaAssetCommand,
): Promise<UploadTicketAttachmentMediaAssetResult> {
  const handle = beginOperation({
    useCase: "media.upload-ticket-attachment-media-asset",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const category = await getOrCreateReservedCategory(
    TICKET_ATTACHMENT_RESERVED_CATEGORY_KEY,
    TICKET_ATTACHMENT_RESERVED_CATEGORY_NAME,
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
