import { getCache, setCache } from "../../../../infrastructure/cache/memory-cache";
import { findSettingByKey } from "./store";
import type { GetSettingQuery, GetSettingResult } from "./types";
import type { SettingRecord } from "../../contracts/types";

const SETTING_CACHE_TTL_SECONDS = 300;
const cacheKeyFor = (key: string) => `settings:${key}`;

// getCache não distingue "nunca cacheado" de "cacheado como null" (ambos retornam null) — uma
// chave inexistente (ex: "theme.active" antes da primeira ativação) precisa ficar em cache
// também, senão toda leitura de uma chave nunca escrita bate no banco. Por isso o valor
// cacheado é sempre o envelope { record }, nunca o record cru.
type CachedSetting = { record: SettingRecord | null };

export async function getSetting(query: GetSettingQuery): Promise<GetSettingResult> {
  const cacheKey = cacheKeyFor(query.key);
  const cached = getCache<CachedSetting>(cacheKey);
  if (cached) {
    return { success: true, data: cached.record };
  }

  const record = await findSettingByKey(query.key);
  setCache<CachedSetting>(cacheKey, { record }, SETTING_CACHE_TTL_SECONDS);

  return { success: true, data: record };
}
