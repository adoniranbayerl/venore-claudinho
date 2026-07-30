import { findCategoryById, updateCategoryName } from "./store";
import type { UpdateCategoryInput, UpdateCategoryResult } from "./types";

export async function updateCategory(input: UpdateCategoryInput): Promise<UpdateCategoryResult> {
  const existing = await findCategoryById(input.id);
  if (!existing) {
    return {
      success: false,
      error: { code: "media.categories.not_found", message: `Nenhuma categoria encontrada com id "${input.id}".` },
    };
  }

  const category = await updateCategoryName(input.id, input.name);
  return { success: true, data: category };
}
