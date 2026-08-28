import { beginOperation, endOperation } from "@/observability";
import { invalidateCacheByPrefix } from "../../../../../infrastructure/cache/memory-cache";
import { assertCmsCategoryScope } from "../../../shared/scoped-authorization";
import { findCategoryByKey, findCategoryBySlug, insertCategory } from "./store";
import type { CreateCategoryCommand, CreateCategoryResult } from "./types";

export async function createCategory(command: CreateCategoryCommand): Promise<CreateCategoryResult> {
  const handle = beginOperation({
    useCase: "cms.create-category",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  // Fase C: criar categoria nova exige `cms.categories.manage` GLOBAL — não dá para escopar algo
  // que ainda não existe (docs/rbac-scoped-roles.md §4.4). Um editor com a permission escopada
  // edita só as suas (quando update-category existir), mas não cria.
  const scope = await assertCmsCategoryScope(command.actorId, ["cms.categories.manage"], null);
  if (!scope.success) {
    endOperation(handle, { success: false, error: scope.error });
    return { success: false, error: scope.error };
  }

  const existingByKey = await findCategoryByKey(command.key);
  if (existingByKey) {
    const error = {
      code: "cms.categories.key_taken",
      message: `Já existe uma categoria com a key "${command.key}".`,
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const existingBySlug = await findCategoryBySlug(command.slug);
  if (existingBySlug) {
    const error = {
      code: "cms.categories.slug_taken",
      message: `Já existe uma categoria com o slug "${command.slug}".`,
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const category = await insertCategory({
    key: command.key,
    slug: command.slug,
    name: command.name,
    description: command.description,
  });

  // Invalidação é responsabilidade de quem escreve (docs/venore-docks.md — Cache).
  invalidateCacheByPrefix("cms:categories");

  endOperation(handle, { success: true });
  return { success: true, data: category };
}
