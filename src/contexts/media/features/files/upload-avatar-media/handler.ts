import { getCurrentUser } from "@/contexts/auth";
import { MEDIA_ALLOWED_TYPES, AVATAR_MAX_SIZE_BYTES } from "../../../contracts/types";
import { uploadAvatarMedia } from "./service";
import type { UploadAvatarMediaInput, UploadAvatarMediaResult } from "./types";

export async function uploadAvatarMediaHandler(input: UploadAvatarMediaInput): Promise<UploadAvatarMediaResult> {
  if (input.filename.trim().length === 0) {
    return {
      success: false,
      error: { code: "media.upload.invalid_filename", message: "O nome do arquivo não pode ser vazio." },
    };
  }

  const rule = MEDIA_ALLOWED_TYPES[input.mimeType];
  if (!rule || rule.category !== "image") {
    return {
      success: false,
      error: { code: "media.avatar.invalid_mime_type", message: "O avatar precisa ser uma imagem (PNG, JPEG, WEBP ou GIF)." },
    };
  }

  if (input.size <= 0) {
    return {
      success: false,
      error: { code: "media.upload.invalid_size", message: "O tamanho do arquivo deve ser maior que zero." },
    };
  }

  if (input.size > AVATAR_MAX_SIZE_BYTES) {
    return {
      success: false,
      error: {
        code: "media.avatar.file_too_large",
        message: `A imagem de avatar precisa ter menos de ${Math.floor(AVATAR_MAX_SIZE_BYTES / 1024)}KB.`,
      },
    };
  }

  // Qualquer ator autenticado pode enviar a própria imagem de avatar — não é gate de permission
  // como media.manage (biblioteca geral), é ação sobre o próprio perfil, mesmo padrão de
  // auth/update-own-avatar (getCurrentUser em vez de authorizeActor).
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: { code: "media.avatar.unauthenticated", message: "É necessário estar autenticado para executar esta operação." },
    };
  }

  return uploadAvatarMedia({ ...input, actorId: currentUser.data.id });
}
