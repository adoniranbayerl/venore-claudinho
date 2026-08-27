import { getCache, setCache } from "@/infrastructure/cache/memory-cache";
import { findExtensionState } from "./store";
import type { GetExtensionStateQuery, GetExtensionStateResult } from "./types";

const EXTENSION_STATE_CACHE_TTL_SECONDS = 60;
export const extensionStateCacheKeyFor = (kind: string, key: string) => `extensions:${kind}:${key}`;

export async function getExtensionState(query: GetExtensionStateQuery): Promise<GetExtensionStateResult> {
  const cacheKey = extensionStateCacheKeyFor(query.kind, query.key);
  const cached = getCache<{ enabled: boolean; installed: boolean }>(cacheKey);
  if (cached) {
    return { success: true, data: cached };
  }

  const row = await findExtensionState(query.kind, query.key);
  // Sem linha == não instalado E habilitado-por-default (ver contracts/types.ts).
  const state = { enabled: row?.enabled ?? true, installed: (row?.installedAt ?? null) !== null };
  setCache(cacheKey, state, EXTENSION_STATE_CACHE_TTL_SECONDS);

  return { success: true, data: state };
}
