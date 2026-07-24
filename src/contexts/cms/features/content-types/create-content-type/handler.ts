import { authorizeActor } from "@/contexts/rbac";
import { createContentType } from "./service";
import type { CreateContentTypeInput, CreateContentTypeResult } from "./types";

const KEBAB_CASE_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function createContentTypeHandler(input: CreateContentTypeInput): Promise<CreateContentTypeResult> {
  if (!KEBAB_CASE_PATTERN.test(input.key)) {
    return {
      success: false,
      error: { code: "cms.content-types.invalid_key", message: "A key do content type deve estar em kebab-case." },
    };
  }

  if (input.name.trim().length === 0) {
    return {
      success: false,
      error: { code: "cms.content-types.invalid_name", message: "O nome do content type não pode ser vazio." },
    };
  }

  const authz = await authorizeActor("cms.content-types.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createContentType({ ...input, actorId: authz.actorId });
}
