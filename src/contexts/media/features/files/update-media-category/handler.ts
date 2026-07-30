import { resolveMediaActorScope } from "../../../resolve-media-actor-scope";
import { updateMediaCategory } from "./service";
import type { UpdateMediaCategoryInput, UpdateMediaCategoryResult } from "./types";

export async function updateMediaCategoryHandler(input: UpdateMediaCategoryInput): Promise<UpdateMediaCategoryResult> {
  const scope = await resolveMediaActorScope();
  if (!scope) {
    return {
      success: false,
      error: { code: "media.not_found", message: `Nenhum arquivo de mídia encontrado com id "${input.id}".` },
    };
  }

  return updateMediaCategory({ ...input, actorId: scope.actorId, isMediaAdmin: scope.isMediaAdmin });
}
