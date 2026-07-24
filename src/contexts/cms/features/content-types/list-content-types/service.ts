import { getCache, setCache } from "../../../../../infrastructure/cache/memory-cache";
import { findAllContentTypes } from "./store";
import type { ContentTypeRecord } from "../../../contracts/types";
import type { ListContentTypesResult } from "./types";

const CONTENT_TYPES_CACHE_KEY = "cms:content-types";
const CONTENT_TYPES_CACHE_TTL_SECONDS = 300;

export async function listContentTypes(): Promise<ListContentTypesResult> {
  const cached = getCache<ContentTypeRecord[]>(CONTENT_TYPES_CACHE_KEY);
  if (cached) {
    return { success: true, data: cached };
  }

  const contentTypes = await findAllContentTypes();
  setCache(CONTENT_TYPES_CACHE_KEY, contentTypes, CONTENT_TYPES_CACHE_TTL_SECONDS);

  return { success: true, data: contentTypes };
}
