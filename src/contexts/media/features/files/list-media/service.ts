import { getCache, setCache } from "@/infrastructure/cache/memory-cache";
import { findAllMedia } from "./store";
import type { MediaRecord } from "../../../contracts/types";
import type { MediaActorScope } from "../../../resolve-media-actor-scope";
import type { ListMediaQuery, ListMediaResult } from "./types";

const MEDIA_LIST_CACHE_TTL_SECONDS = 300;

// Chave inclui o escopo do ator porque o resultado agora varia por quem pergunta (visibilidade)
// — uma chave única compartilhada vazaria a lista do primeiro ator que a popular pra todos os
// seguintes (mesma classe de bug que este fix resolve, só que via cache em vez de query). Também
// inclui o filtro de categoria pelo mesmo motivo: uma chave por (escopo, filtro), nunca uma só
// pra todas as combinações — sem isso, filtrar por categoria A e depois listar tudo mostraria o
// resultado cacheado da categoria A por até TTL.
function cacheKeyFor(scope: MediaActorScope, categoryId?: string): string {
  const scopePart = scope.isMediaAdmin ? "admin" : `actor:${scope.actorId}`;
  const categoryPart = categoryId ?? "all";
  return `media:files:${scopePart}:category:${categoryPart}`;
}

export async function listMedia(scope: MediaActorScope, query: ListMediaQuery = {}): Promise<ListMediaResult> {
  const cacheKey = cacheKeyFor(scope, query.categoryId);
  const cached = getCache<MediaRecord[]>(cacheKey);
  if (cached) {
    return { success: true, data: cached };
  }

  const media = await findAllMedia(scope, query.categoryId);
  setCache(cacheKey, media, MEDIA_LIST_CACHE_TTL_SECONDS);

  return { success: true, data: media };
}
