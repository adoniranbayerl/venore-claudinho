import { resolveMediaActorScope } from "../../../resolve-media-actor-scope";
import { listMedia } from "./service";
import type { ListMediaResult } from "./types";

export async function listMediaHandler(): Promise<ListMediaResult> {
  const scope = await resolveMediaActorScope();
  if (!scope) {
    return { success: true, data: [] };
  }

  return listMedia(scope);
}
