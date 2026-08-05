import { resolveMediaActorScope } from "../../../resolve-media-actor-scope";
import { getMediaAsset } from "./service";
import type { GetMediaAssetQuery, GetMediaAssetResult } from "./types";

export async function getMediaAssetHandler(query: GetMediaAssetQuery): Promise<GetMediaAssetResult> {
  const scope = await resolveMediaActorScope();
  if (!scope) {
    return { success: true, data: null };
  }

  return getMediaAsset(query, scope);
}
