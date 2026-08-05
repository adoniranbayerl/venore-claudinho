import { getCurrentUser } from "@/contexts/auth";
import { MEDIA_ALLOWED_TYPES } from "../../../contracts/types";
import { uploadActivitySubmissionMediaAsset } from "./service";
import type { UploadActivitySubmissionMediaAssetInput, UploadActivitySubmissionMediaAssetResult } from "./types";

// "audio"/"image"/"document" — os três formatos que uma lessonActivity aceita hoje (ver
// DeliverableFormat em src/plugins/academy/contracts/types.ts: "audio" | "image" | "pdf"). Sem
// "video": nenhum deliverableFormat de atividade prática pede vídeo.
const ALLOWED_CATEGORIES = new Set(["audio", "image", "document"]);

export async function uploadActivitySubmissionMediaAssetHandler(
  input: UploadActivitySubmissionMediaAssetInput,
): Promise<UploadActivitySubmissionMediaAssetResult> {
  if (input.filename.trim().length === 0) {
    return { success: false, error: { code: "media.upload.invalid_filename", message: "O nome do arquivo não pode ser vazio." } };
  }

  const rule = MEDIA_ALLOWED_TYPES[input.contentType];
  if (!rule || !ALLOWED_CATEGORIES.has(rule.category)) {
    return {
      success: false,
      error: {
        code: "media.activity_submission.invalid_mime_type",
        message: "A entrega precisa ser um áudio, imagem ou PDF.",
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
        message: `O arquivo excede o limite de ${Math.floor(rule.maxSizeBytes / (1024 * 1024))}MB para o tipo "${input.contentType}".`,
      },
    };
  }

  // Qualquer ator autenticado pode enviar sua própria entrega — não é gate de permission como
  // media.manage (biblioteca geral), é ação sobre a própria submissão (mesma lógica do upload de
  // avatar). submit-lesson-activity, do lado da academy, é quem valida matrícula/aula
  // acessível/atividade habilitada antes de aceitar o mediaId resultante.
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: { code: "media.activity_submission.unauthenticated", message: "É necessário estar autenticado para executar esta operação." },
    };
  }

  return uploadActivitySubmissionMediaAsset({ ...input, actorId: currentUser.data.id });
}
