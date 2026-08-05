import { resolveMediaActorScope } from "../../../resolve-media-actor-scope";
import { listMediaAssets } from "./service";
import type { ListMediaAssetsQuery, ListMediaAssetsResult } from "./types";

export async function listMediaAssetsHandler(query: ListMediaAssetsQuery = {}): Promise<ListMediaAssetsResult> {
  const scope = await resolveMediaActorScope();
  if (!scope) {
    return { success: true, data: [] };
  }

  return listMediaAssets(scope, query);
}
