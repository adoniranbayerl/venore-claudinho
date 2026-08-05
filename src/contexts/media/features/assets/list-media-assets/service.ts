import { getCache, setCache } from "@/infrastructure/cache/memory-cache";
import { findAllAssets } from "./store";
import type { MediaAsset } from "../../../contracts/types";
import type { MediaActorScope } from "../../../resolve-media-actor-scope";
import type { ListMediaAssetsQuery, ListMediaAssetsResult } from "./types";

const MEDIA_LIST_CACHE_TTL_SECONDS = 300;

// Chave inclui o escopo do ator (visibilidade varia por quem pergunta) e o filtro de categoria —
// mesmo raciocínio de cms:content-types cachear entryCount (Fase 3/C8): uma chave por combinação,
// nunca uma só compartilhada.
function cacheKeyFor(scope: MediaActorScope, categoryId?: string): string {
  const scopePart = scope.isMediaAdmin ? "admin" : `actor:${scope.actorId}`;
  const categoryPart = categoryId ?? "all";
  return `media:assets:${scopePart}:category:${categoryPart}`;
}

export async function listMediaAssets(scope: MediaActorScope, query: ListMediaAssetsQuery = {}): Promise<ListMediaAssetsResult> {
  const cacheKey = cacheKeyFor(scope, query.categoryId);
  const cached = getCache<MediaAsset[]>(cacheKey);
  if (cached) {
    return { success: true, data: cached };
  }

  const media = await findAllAssets(scope, query.categoryId);
  setCache(cacheKey, media, MEDIA_LIST_CACHE_TTL_SECONDS);

  return { success: true, data: media };
}
