import { authorizeActor } from "@/contexts/rbac";
import { deleteMediaAsset } from "./service";
import type { DeleteMediaAssetInput, DeleteMediaAssetResult } from "./types";

export async function deleteMediaAssetHandler(input: DeleteMediaAssetInput): Promise<DeleteMediaAssetResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "media.delete.invalid_id", message: "O id do asset não pode ser vazio." } };
  }

  const authz = await authorizeActor("media.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return deleteMediaAsset({ ...input, actorId: authz.actorId });
}
