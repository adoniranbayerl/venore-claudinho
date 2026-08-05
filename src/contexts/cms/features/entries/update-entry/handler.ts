import { authorizeActor } from "@/contexts/rbac";
import { updateEntry } from "./service";
import type { UpdateEntryInput, UpdateEntryResult } from "./types";

export async function updateEntryHandler(input: UpdateEntryInput): Promise<UpdateEntryResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "cms.entries.invalid_id", message: "id não pode ser vazio." } };
  }

  if (input.title !== undefined && input.title.trim().length === 0) {
    return {
      success: false,
      error: { code: "cms.entries.invalid_title", message: "O título da entry não pode ser vazio." },
    };
  }

  if (input.slug !== undefined && input.slug.trim().length === 0) {
    return {
      success: false,
      error: { code: "cms.entries.invalid_slug", message: "O slug da entry não pode ser vazio." },
    };
  }

  if (input.contentTypeIds !== undefined && input.contentTypeIds.length === 0) {
    return {
      success: false,
      error: { code: "cms.entries.invalid_content_type", message: "Selecione ao menos uma tag." },
    };
  }

  const authz = await authorizeActor("cms.entries.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return updateEntry({ ...input, actorId: authz.actorId });
}
