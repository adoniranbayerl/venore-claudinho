import { beginOperation, endOperation } from "@/observability";
import { invalidateCache } from "../../../../../infrastructure/cache/memory-cache";
import { assertCmsCategoryScope } from "../../../shared/scoped-authorization";
import { deleteEntryById, findEntryById } from "./store";
import type { DeleteEntryCommand, DeleteEntryResult } from "./types";

// C6 (docs/implementation-roadmap.md, Fase 3): só entry arquivada pode ser deletada
// definitivamente — draft/scheduled/published precisam passar por archive-entry antes.
export async function deleteEntry(command: DeleteEntryCommand): Promise<DeleteEntryResult> {
  const handle = beginOperation({
    useCase: "cms.delete-entry",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findEntryById(command.id);
  if (!existing) {
    const error = { code: "cms.entries.not_found", message: `Entry "${command.id}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  if (existing.status !== "archived") {
    const error = {
      code: "cms.entries.delete_requires_archived",
      message: "Só é possível excluir definitivamente um conteúdo arquivado.",
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  // Fase C: só exclui entries nas categorias do próprio escopo.
  const scope = await assertCmsCategoryScope(command.actorId, ["cms.entries.manage"], existing.categoryId);
  if (!scope.success) {
    endOperation(handle, { success: false, error: scope.error });
    return { success: false, error: scope.error };
  }

  await deleteEntryById(command.id);

  // Exclusão derruba as linhas do junction junto (onDelete: cascade) — entryCount por tag
  // (Fase 3/C8) fica desatualizado no cache até esta invalidação.
  invalidateCache("cms:content-types");

  endOperation(handle, { success: true });
  return { success: true, data: undefined };
}
