import { authorizeCategoryConfigActor } from "../../../shared/scoped-authorization";
import { archiveCategory } from "./service";
import type { ArchiveCategoryInput, ArchiveCategoryResult } from "./types";

export async function archiveCategoryHandler(input: ArchiveCategoryInput): Promise<ArchiveCategoryResult> {
  if (!input.categoryId || input.categoryId.trim().length === 0) {
    return { success: false, error: { code: "helpdesk.archive-category.missing_category", message: "Categoria não informada." } };
  }

  const authz = await authorizeCategoryConfigActor(input.categoryId);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return archiveCategory({ ...input, actorId: authz.actorId });
}
