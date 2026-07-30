import { findMediaById } from "./store";
import type { MediaActorScope } from "../../../resolve-media-actor-scope";
import type { GetMediaQuery, GetMediaResult } from "./types";

export async function getMedia(query: GetMediaQuery, scope: MediaActorScope): Promise<GetMediaResult> {
  const media = await findMediaById(query.id, scope);
  return { success: true, data: media };
}
