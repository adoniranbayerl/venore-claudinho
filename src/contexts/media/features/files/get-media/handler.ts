import { resolveMediaActorScope } from "../../../resolve-media-actor-scope";
import { getMedia } from "./service";
import type { GetMediaQuery, GetMediaResult } from "./types";

export async function getMediaHandler(query: GetMediaQuery): Promise<GetMediaResult> {
  const scope = await resolveMediaActorScope();
  if (!scope) {
    return { success: true, data: null };
  }

  return getMedia(query, scope);
}
