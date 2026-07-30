import { resolveMediaActorScope } from "../../../resolve-media-actor-scope";
import { updateMediaVisibility } from "./service";
import type { UpdateMediaVisibilityInput, UpdateMediaVisibilityResult } from "./types";

export async function updateMediaVisibilityHandler(input: UpdateMediaVisibilityInput): Promise<UpdateMediaVisibilityResult> {
  const scope = await resolveMediaActorScope();
  if (!scope) {
    return {
      success: false,
      error: { code: "media.not_found", message: `Nenhum arquivo de mídia encontrado com id "${input.id}".` },
    };
  }

  return updateMediaVisibility({ ...input, actorId: scope.actorId, isMediaAdmin: scope.isMediaAdmin });
}
