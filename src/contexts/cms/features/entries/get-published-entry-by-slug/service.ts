import { getCache, setCache } from "../../../../../infrastructure/cache/memory-cache";
import { findPublishedEntryByCategoryAndSlug } from "./store";
import type { EntryRecord } from "../../../contracts/types";
import type { GetPublishedEntryBySlugQuery, GetPublishedEntryBySlugResult } from "./types";

const PUBLISHED_ENTRY_BY_SLUG_CACHE_TTL_SECONDS = 60;

// Mesma envelope não-nula de get-category-by-slug: diferencia "nada em cache ainda" de "em cache,
// e o resultado de negócio é que não existe" (docs/venore-docks.md — Cache).
type CachedLookup = { record: EntryRecord | null };

function cacheKeyFor(categoryId: string | null, slug: string): string {
  // Prefixo "cms:entries:published" de propósito: publish-entry e update-entry já chamam
  // invalidateCacheByPrefix("cms:entries:published") hoje, então essa chave é invalidada de graça
  // sempre que uma entry publicada muda, sem precisar tocar nesses dois services de novo.
  return `cms:entries:published:by-slug:${categoryId ?? "*"}:${slug}`;
}

export async function getPublishedEntryBySlug(
  query: GetPublishedEntryBySlugQuery,
): Promise<GetPublishedEntryBySlugResult> {
  const cacheKey = cacheKeyFor(query.categoryId, query.slug);
  const cached = getCache<CachedLookup>(cacheKey);
  if (cached) {
    return { success: true, data: cached.record };
  }

  const record = await findPublishedEntryByCategoryAndSlug(query.categoryId, query.slug);
  setCache(cacheKey, { record }, PUBLISHED_ENTRY_BY_SLUG_CACHE_TTL_SECONDS);

  return { success: true, data: record };
}
