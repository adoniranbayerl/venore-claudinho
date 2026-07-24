import { authorizeActor } from "@/contexts/rbac";
import { createCategory } from "./service";
import type { CreateCategoryInput, CreateCategoryResult } from "./types";

const KEBAB_CASE_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function createCategoryHandler(input: CreateCategoryInput): Promise<CreateCategoryResult> {
  if (!KEBAB_CASE_PATTERN.test(input.key)) {
    return {
      success: false,
      error: { code: "cms.categories.invalid_key", message: "A key da categoria deve estar em kebab-case." },
    };
  }

  if (input.name.trim().length === 0) {
    return {
      success: false,
      error: { code: "cms.categories.invalid_name", message: "O nome da categoria não pode ser vazio." },
    };
  }

  const authz = await authorizeActor("cms.categories.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createCategory({ ...input, actorId: authz.actorId });
}
