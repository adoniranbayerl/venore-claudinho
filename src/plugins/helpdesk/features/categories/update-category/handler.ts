import { authorizeCategoryConfigActor } from "../../../shared/scoped-authorization";
import { updateCategory } from "./service";
import { validateUpdateCategoryInput } from "./validation";
import type { UpdateCategoryInput, UpdateCategoryResult } from "./types";

export async function updateCategoryHandler(input: UpdateCategoryInput): Promise<UpdateCategoryResult> {
  const validationError = validateUpdateCategoryInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeCategoryConfigActor(input.categoryId);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return updateCategory({ ...input, actorId: authz.actorId });
}
