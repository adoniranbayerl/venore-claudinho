import { getMedia } from "./service";
import type { GetMediaQuery, GetMediaResult } from "./types";

export async function getMediaHandler(query: GetMediaQuery): Promise<GetMediaResult> {
  return getMedia(query);
}
