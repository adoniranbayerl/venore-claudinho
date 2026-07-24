import { beginOperation, endOperation } from "@/observability";
import { findCategoryByKey, insertCategory } from "./store";
import type { CreateCategoryCommand, CreateCategoryResult } from "./types";

export async function createCategory(command: CreateCategoryCommand): Promise<CreateCategoryResult> {
  const handle = beginOperation({
    useCase: "cms.create-category",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findCategoryByKey(command.key);
  if (existing) {
    const error = {
      code: "cms.categories.key_taken",
      message: `Já existe uma categoria com a key "${command.key}".`,
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const category = await insertCategory({
    key: command.key,
    name: command.name,
    description: command.description,
  });

  endOperation(handle, { success: true });
  return { success: true, data: category };
}
