import { authorizeActor } from "@/contexts/rbac";
import { createEntry } from "./service";
import type { CreateEntryInput, CreateEntryResult } from "./types";

export async function createEntryHandler(input: CreateEntryInput): Promise<CreateEntryResult> {
  if (input.contentTypeIds.length === 0) {
    return {
      success: false,
      error: { code: "cms.entries.invalid_content_type", message: "Selecione ao menos uma tag." },
    };
  }

  if (input.title.trim().length === 0) {
    return {
      success: false,
      error: { code: "cms.entries.invalid_title", message: "O título da entry não pode ser vazio." },
    };
  }

  if (input.slug.trim().length === 0) {
    return {
      success: false,
      error: { code: "cms.entries.invalid_slug", message: "O slug da entry não pode ser vazio." },
    };
  }

  const authz = await authorizeActor("cms.entries.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createEntry({ ...input, actorId: authz.actorId });
}
