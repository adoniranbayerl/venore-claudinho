import { findAllCategoriesWithEntryCount } from "./store";
import type { ListCategoriesResult } from "./types";

export async function listCategories(): Promise<ListCategoriesResult> {
  const categories = await findAllCategoriesWithEntryCount();
  return { success: true, data: categories };
}
