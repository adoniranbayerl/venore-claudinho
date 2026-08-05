import { beginOperation, endOperation } from "@/observability";
import { invalidateCacheByPrefix } from "../../../../../infrastructure/cache/memory-cache";
import { findEntryById, markEntryArchived } from "./store";
import type { ArchiveEntryCommand, ArchiveEntryResult } from "./types";

export async function archiveEntry(command: ArchiveEntryCommand): Promise<ArchiveEntryResult> {
  const handle = beginOperation({
    useCase: "cms.archive-entry",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findEntryById(command.id);
  if (!existing) {
    const error = { code: "cms.entries.not_found", message: `Entry "${command.id}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  if (existing.status === "archived") {
    const error = { code: "cms.entries.already_archived", message: `Entry "${command.id}" já está arquivada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const entry = await markEntryArchived(command.id);

  // Arquivar tira do ar uma entry que podia estar publicada — mesma invalidação de
  // publish-entry/update-entry (docs/venore-docks.md — Cache), aplicada sempre (mais simples do
  // que checar se existing.status === "published" e nunca incorreta: invalidar cache que já
  // estava vazio/frio não tem custo relevante).
  invalidateCacheByPrefix("cms:entries:published");
  invalidateCacheByPrefix("cms:navigation");

  endOperation(handle, { success: true });
  return { success: true, data: entry };
}
