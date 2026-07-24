import { getCache, setCache } from "@/infrastructure/cache/memory-cache";
import { findAllMedia } from "./store";
import type { MediaRecord } from "../../../contracts/types";
import type { ListMediaResult } from "./types";

const MEDIA_LIST_CACHE_KEY = "media:files";
const MEDIA_LIST_CACHE_TTL_SECONDS = 300;

export async function listMedia(): Promise<ListMediaResult> {
  const cached = getCache<MediaRecord[]>(MEDIA_LIST_CACHE_KEY);
  if (cached) {
    return { success: true, data: cached };
  }

  const media = await findAllMedia();
  setCache(MEDIA_LIST_CACHE_KEY, media, MEDIA_LIST_CACHE_TTL_SECONDS);

  return { success: true, data: media };
}
