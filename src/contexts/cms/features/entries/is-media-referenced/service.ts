import { findAnyEntryByMediaId } from "./store";
import type { IsMediaReferencedQuery, IsMediaReferencedResult } from "./types";

export async function isMediaReferenced(query: IsMediaReferencedQuery): Promise<IsMediaReferencedResult> {
  const referenced = await findAnyEntryByMediaId(query.mediaId);
  return { success: true, data: referenced };
}
