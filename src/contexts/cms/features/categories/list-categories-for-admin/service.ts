import { findCategoriesWithEntryCount } from "./store";
import type { ListCategoriesForAdminQuery, ListCategoriesForAdminResult } from "./types";

export async function listCategoriesForAdmin(
  query: ListCategoriesForAdminQuery = {},
): Promise<ListCategoriesForAdminResult> {
  const categories = await findCategoriesWithEntryCount(query.allowedCategoryIds);
  return { success: true, data: categories };
}
