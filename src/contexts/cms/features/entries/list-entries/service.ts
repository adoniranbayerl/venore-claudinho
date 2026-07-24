import { getCache, setCache } from "../../../../../infrastructure/cache/memory-cache";
import { findPublishedEntries } from "./store";
import { toEntryView } from "./view";
import type { ListEntriesQuery, ListEntriesResult, EntryView } from "./types";

const PUBLISHED_ENTRIES_CACHE_TTL_SECONDS = 60;

function cacheKeyFor(query: ListEntriesQuery): string {
  return `cms:entries:published:${query.contentTypeId ?? "*"}:${query.categoryId ?? "*"}`;
}

export async function listEntries(query: ListEntriesQuery): Promise<ListEntriesResult> {
  const cacheKey = cacheKeyFor(query);
  const cached = getCache<EntryView[]>(cacheKey);
  if (cached) {
    return { success: true, data: cached };
  }

  const records = await findPublishedEntries(query);
  const views = records.map(toEntryView);
  setCache(cacheKey, views, PUBLISHED_ENTRIES_CACHE_TTL_SECONDS);

  return { success: true, data: views };
}
