import { authorizeActor } from "@/contexts/rbac";
import { uploadMedia } from "./service";
import type { UploadMediaInput, UploadMediaResult } from "./types";

export async function uploadMediaHandler(input: UploadMediaInput): Promise<UploadMediaResult> {
  if (input.filename.trim().length === 0) {
    return {
      success: false,
      error: { code: "media.upload.invalid_filename", message: "O nome do arquivo não pode ser vazio." },
    };
  }

  if (input.mimeType.trim().length === 0) {
    return {
      success: false,
      error: { code: "media.upload.invalid_mime_type", message: "O mimeType do arquivo não pode ser vazio." },
    };
  }

  if (input.size <= 0) {
    return {
      success: false,
      error: { code: "media.upload.invalid_size", message: "O tamanho do arquivo deve ser maior que zero." },
    };
  }

  const authz = await authorizeActor("media.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return uploadMedia({ ...input, actorId: authz.actorId });
}
