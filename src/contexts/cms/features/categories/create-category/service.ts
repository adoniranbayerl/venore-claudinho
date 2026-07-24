import { beginOperation, endOperation } from "@/observability";
import { invalidateCacheByPrefix } from "../../../../../infrastructure/cache/memory-cache";
import { findCategoryByKey, findCategoryBySlug, insertCategory } from "./store";
import type { CreateCategoryCommand, CreateCategoryResult } from "./types";

export async function createCategory(command: CreateCategoryCommand): Promise<CreateCategoryResult> {
  const handle = beginOperation({
    useCase: "cms.create-category",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

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
