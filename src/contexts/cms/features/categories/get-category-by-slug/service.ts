import { getCache, setCache } from "../../../../../infrastructure/cache/memory-cache";
import { findCategoryBySlug } from "./store";
import type { CategoryRecord } from "../../../contracts/types";
import type { GetCategoryBySlugQuery, GetCategoryBySlugResult } from "./types";

const CATEGORY_BY_SLUG_CACHE_TTL_SECONDS = 300;

// Cacheia o resultado inteiro (achado ou não) numa envelope não-nula, pra diferenciar "cache miss"
// (nada guardado ainda) de "cache hit com miss de negócio" (slug não existe) — os dois não podem
// colapsar no mesmo `null` (docs/venore-docks.md — Cache).
type CachedLookup = { record: CategoryRecord | null };

function cacheKeyFor(slug: string): string {
  return `cms:categories:by-slug:${slug}`;
}

export async function getCategoryBySlug(query: GetCategoryBySlugQuery): Promise<GetCategoryBySlugResult> {
  const cacheKey = cacheKeyFor(query.slug);
  const cached = getCache<CachedLookup>(cacheKey);
  if (cached) {
    return { success: true, data: cached.record };
  }

  const record = await findCategoryBySlug(query.slug);
  setCache(cacheKey, { record }, CATEGORY_BY_SLUG_CACHE_TTL_SECONDS);

  return { success: true, data: record };
}
