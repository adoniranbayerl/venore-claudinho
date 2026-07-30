import { MEDIA_ALLOWED_TYPES } from "@/contexts/media/contracts/types";
import { beginOperation, endOperation } from "@/observability";
import type { OperationResult } from "@/shared/types";
import type { MediaUploadTicket, RequestMediaUploadTicketCommand } from "./types";

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

// Reaproveitada tanto pelo passo inicial (requestMediaUploadTicket) quanto pela revalidação
// dentro de onBeforeGenerateToken no route handler (blob-spec seção 5 — o limite é checado duas
// vezes: no ticket e de novo quando o upload é confirmado).
export function validateMediaUploadCandidate(input: {
  contentType: string;
  size: number;
}): OperationResult<{ maxSizeBytes: number }> {
  const rule = MEDIA_ALLOWED_TYPES[input.contentType];
  if (!rule) {
    return {
      success: false,
      error: {
        code: "media.upload.unsupported_type",
        message: `O tipo de arquivo "${input.contentType}" não é permitido.`,
      },
    };
  }

  if (input.size <= 0) {
    return { success: false, error: { code: "media.upload.invalid_size", message: "O tamanho do arquivo deve ser maior que zero." } };
  }

  if (input.size > rule.maxSizeBytes) {
    return {
      success: false,
      error: {
        code: "media.upload.file_too_large",
        message: `O arquivo excede o limite de ${rule.maxSizeBytes} bytes para o tipo "${input.contentType}".`,
      },
    };
  }

  return { success: true, data: { maxSizeBytes: rule.maxSizeBytes } };
}

export async function requestMediaUploadTicket(
  command: RequestMediaUploadTicketCommand,
): Promise<OperationResult<MediaUploadTicket>> {
  const handle = beginOperation({
    useCase: "media.request-media-upload-ticket",
    actor: { id: command.actorId, type: "user" },
    kind: "read",
  });

  const validation = validateMediaUploadCandidate(command);
  if (!validation.success) {
    endOperation(handle, validation);
    return validation;
  }

  const pathname = `${crypto.randomUUID()}-${sanitizeFilename(command.filename)}`;
  endOperation(handle, { success: true });
  return {
    success: true,
    data: { pathname, contentType: command.contentType, maxSizeBytes: validation.data.maxSizeBytes },
  };
}
