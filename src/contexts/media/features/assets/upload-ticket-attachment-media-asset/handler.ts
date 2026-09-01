import { getCurrentUser } from "@/contexts/auth";
import { MEDIA_ALLOWED_TYPES, TICKET_ATTACHMENT_MAX_SIZE_BYTES } from "../../../contracts/types";
import { uploadTicketAttachmentMediaAsset } from "./service";
import type { UploadTicketAttachmentMediaAssetInput, UploadTicketAttachmentMediaAssetResult } from "./types";

// Anexo de chamado é foto do problema ou PDF (orçamento, nota) — "image"/"document" só. Sem
// "audio"/"video": a timeline do chamado é texto + foto.
const ALLOWED_CATEGORIES = new Set(["image", "document"]);

export async function uploadTicketAttachmentMediaAssetHandler(
  input: UploadTicketAttachmentMediaAssetInput,
): Promise<UploadTicketAttachmentMediaAssetResult> {
  if (input.filename.trim().length === 0) {
    return { success: false, error: { code: "media.upload.invalid_filename", message: "O nome do arquivo não pode ser vazio." } };
  }

  const rule = MEDIA_ALLOWED_TYPES[input.contentType];
  if (!rule || !ALLOWED_CATEGORIES.has(rule.category)) {
    return {
      success: false,
      error: {
        code: "media.ticket_attachment.invalid_mime_type",
        message: "O anexo precisa ser uma imagem ou um PDF.",
      },
    };
  }

  if (input.size <= 0) {
    return { success: false, error: { code: "media.upload.invalid_size", message: "O tamanho do arquivo deve ser maior que zero." } };
  }

  const maxSize = Math.min(rule.maxSizeBytes, TICKET_ATTACHMENT_MAX_SIZE_BYTES);
  if (input.size > maxSize) {
    return {
      success: false,
      error: {
        code: "media.upload.file_too_large",
        message: `O anexo excede o limite de ${Math.floor(maxSize / (1024 * 1024))}MB.`,
      },
    };
  }

  // Qualquer ator autenticado anexa ao próprio chamado — não é gate de permission como
  // media.manage (biblioteca geral), é ação sobre um chamado (mesma lógica do upload de avatar e
  // da entrega de atividade). add-ticket-attachment, do lado do helpdesk, valida o acesso ao
  // chamado antes de aceitar o mediaId resultante.
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: { code: "media.ticket_attachment.unauthenticated", message: "É necessário estar autenticado para executar esta operação." },
    };
  }

  return uploadTicketAttachmentMediaAsset({ ...input, actorId: currentUser.data.id });
}
