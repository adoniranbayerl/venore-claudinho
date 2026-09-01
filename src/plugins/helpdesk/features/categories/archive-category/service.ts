import { beginOperation, endOperation } from "@/observability";
import { findCategoryById, setCategoryArchived } from "./store";
import type { ArchiveCategoryCommand, ArchiveCategoryResult } from "./types";

export async function archiveCategory(command: ArchiveCategoryCommand): Promise<ArchiveCategoryResult> {
  const existing = await findCategoryById(command.categoryId);
  if (!existing) {
    return { success: false, error: { code: "helpdesk.archive-category.not_found", message: "Categoria não encontrada." } };
  }

  const handle = beginOperation({
    useCase: "helpdesk.archive-category",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const record = await setCategoryArchived(command.categoryId, command.archived ? new Date() : null);

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
