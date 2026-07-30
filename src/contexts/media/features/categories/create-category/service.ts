import { findCategoryByKey, insertCategory } from "./store";
import type { CreateCategoryInput, CreateCategoryResult } from "./types";

export async function createCategory(input: CreateCategoryInput): Promise<CreateCategoryResult> {
  const existing = await findCategoryByKey(input.key);
  if (existing) {
    return {
      success: false,
      error: { code: "media.categories.duplicate_key", message: `Já existe uma categoria com a chave "${input.key}".` },
    };
  }

  const category = await insertCategory(input);
  return { success: true, data: category };
}
