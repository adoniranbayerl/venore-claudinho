import { findCategories } from "./store";
import type { ListCategoriesResult } from "./types";

export async function listCategories(options: { queueId: string; includeArchived?: boolean }): Promise<ListCategoriesResult> {
  return { success: true, data: await findCategories(options.queueId, options.includeArchived ?? false) };
}
