import { authorizeActor } from "@/contexts/rbac";
import { uploadMediaAsset } from "./service";
import type { UploadMediaAssetInput, UploadMediaAssetResult } from "./types";

export async function uploadMediaAssetHandler(input: UploadMediaAssetInput): Promise<UploadMediaAssetResult> {
  if (input.filename.trim().length === 0) {
    return { success: false, error: { code: "media.upload.invalid_filename", message: "O nome do arquivo não pode ser vazio." } };
  }

  if (input.contentType.trim().length === 0) {
    return { success: false, error: { code: "media.upload.invalid_mime_type", message: "O contentType do arquivo não pode ser vazio." } };
  }

  if (input.size <= 0) {
    return { success: false, error: { code: "media.upload.invalid_size", message: "O tamanho do arquivo deve ser maior que zero." } };
  }

  const authz = await authorizeActor("media.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  const visibility = input.visibility === "public" || input.visibility === "restricted" ? input.visibility : "private";

  return uploadMediaAsset({ ...input, visibility, actorId: authz.actorId });
}
