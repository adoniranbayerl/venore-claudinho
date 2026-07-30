import { authorizeActor } from "@/contexts/rbac";
import { deleteCategory } from "./service";
import type { DeleteCategoryInput, DeleteCategoryResult } from "./types";

export async function deleteCategoryHandler(input: DeleteCategoryInput): Promise<DeleteCategoryResult> {
  const authz = await authorizeActor("media.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return deleteCategory(input);
}
