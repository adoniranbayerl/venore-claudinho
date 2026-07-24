import { isMediaReferenced } from "./service";
import type { IsMediaReferencedQuery, IsMediaReferencedResult } from "./types";

export async function isMediaReferencedHandler(query: IsMediaReferencedQuery): Promise<IsMediaReferencedResult> {
  return isMediaReferenced(query);
}
