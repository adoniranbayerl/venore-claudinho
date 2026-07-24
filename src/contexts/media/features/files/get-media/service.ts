import { findMediaById } from "./store";
import type { GetMediaQuery, GetMediaResult } from "./types";

export async function getMedia(query: GetMediaQuery): Promise<GetMediaResult> {
  const media = await findMediaById(query.id);
  return { success: true, data: media };
}
