import { findAllCategories } from "./store";
import type { ListCategoriesResult } from "./types";

export async function listCategories(): Promise<ListCategoriesResult> {
  const categories = await findAllCategories();
  return { success: true, data: categories };
}
