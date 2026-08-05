import { authorizeActor } from "@/contexts/rbac";
import { purgeMediaAsset } from "./service";
import type { PurgeMediaAssetInput, PurgeMediaAssetResult } from "./types";

export async function purgeMediaAssetHandler(input: PurgeMediaAssetInput): Promise<PurgeMediaAssetResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "media.purge.invalid_id", message: "O id do asset não pode ser vazio." } };
  }

  const authz = await authorizeActor("media.purge");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return purgeMediaAsset({ ...input, actorId: authz.actorId });
}
