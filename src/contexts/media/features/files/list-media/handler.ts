import { resolveMediaActorScope } from "../../../resolve-media-actor-scope";
import { listMedia } from "./service";
import type { ListMediaQuery, ListMediaResult } from "./types";

export async function listMediaHandler(query: ListMediaQuery = {}): Promise<ListMediaResult> {
  const scope = await resolveMediaActorScope();
  if (!scope) {
    return { success: true, data: [] };
  }

  return listMedia(scope, query);
}
