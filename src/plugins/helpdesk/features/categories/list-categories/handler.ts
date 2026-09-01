import { authorizeQueueViewActor } from "../../../shared/scoped-authorization";
import { listCategories } from "./service";
import type { ListCategoriesResult } from "./types";

export async function listCategoriesHandler(options: {
  queueId: string;
  includeArchived?: boolean;
}): Promise<ListCategoriesResult> {
  if (!options.queueId || options.queueId.trim().length === 0) {
    return { success: false, error: { code: "helpdesk.list-categories.missing_queue", message: "Fila não informada." } };
  }

  const authz = await authorizeQueueViewActor(options.queueId);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listCategories(options);
}
