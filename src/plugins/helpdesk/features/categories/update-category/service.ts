import { beginOperation, endOperation } from "@/observability";
import { findCategoryById, updateCategoryRow } from "./store";
import type { UpdateCategoryCommand, UpdateCategoryResult } from "./types";

export async function updateCategory(command: UpdateCategoryCommand): Promise<UpdateCategoryResult> {
  const existing = await findCategoryById(command.categoryId);
  if (!existing) {
    return { success: false, error: { code: "helpdesk.update-category.not_found", message: "Categoria não encontrada." } };
  }

  const handle = beginOperation({
    useCase: "helpdesk.update-category",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const record = await updateCategoryRow(command.categoryId, {
    label: command.label.trim(),
    description: command.description?.trim() || null,
  });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
