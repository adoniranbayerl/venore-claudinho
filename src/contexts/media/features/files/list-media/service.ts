import { getCache, setCache } from "@/infrastructure/cache/memory-cache";
import { findAllMedia } from "./store";
import type { MediaRecord } from "../../../contracts/types";
import type { MediaActorScope } from "../../../resolve-media-actor-scope";
import type { ListMediaResult } from "./types";

const MEDIA_LIST_CACHE_TTL_SECONDS = 300;

// Chave inclui o escopo do ator porque o resultado agora varia por quem pergunta (visibilidade)
// — uma chave única compartilhada vazaria a lista do primeiro ator que a popular pra todos os
// seguintes (mesma classe de bug que este fix resolve, só que via cache em vez de query).
function cacheKeyFor(scope: MediaActorScope): string {
  return scope.isMediaAdmin ? "media:files:admin" : `media:files:actor:${scope.actorId}`;
}

export async function listMedia(scope: MediaActorScope): Promise<ListMediaResult> {
  const cacheKey = cacheKeyFor(scope);
  const cached = getCache<MediaRecord[]>(cacheKey);
  if (cached) {
    return { success: true, data: cached };
  }

  const media = await findAllMedia(scope);
  setCache(cacheKey, media, MEDIA_LIST_CACHE_TTL_SECONDS);

  return { success: true, data: media };
}
