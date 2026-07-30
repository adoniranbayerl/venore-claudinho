import { getCache, setCache } from "@/infrastructure/cache/memory-cache";
import { findExtensionStatesByKind } from "./store";
import type { ListExtensionStatesQuery, ListExtensionStatesResult } from "./types";

const LIST_CACHE_TTL_SECONDS = 60;
export const listExtensionStatesCacheKeyFor = (kind: string) => `extensions:list:${kind}`;

export async function listExtensionStates(query: ListExtensionStatesQuery): Promise<ListExtensionStatesResult> {
  const cacheKey = listExtensionStatesCacheKeyFor(query.kind);
  const cached = getCache<Record<string, boolean>>(cacheKey);
  if (cached) {
    return { success: true, data: cached };
  }

  const rows = await findExtensionStatesByKind(query.kind);
  const map = Object.fromEntries(rows.map((row) => [row.key, row.enabled]));
  setCache(cacheKey, map, LIST_CACHE_TTL_SECONDS);

  return { success: true, data: map };
}
