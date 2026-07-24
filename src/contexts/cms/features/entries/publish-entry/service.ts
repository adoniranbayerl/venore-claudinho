import { beginOperation, endOperation } from "@/observability";
import { invalidateCacheByPrefix } from "../../../../../infrastructure/cache/memory-cache";
import { findEntryById, markEntryPublished } from "./store";
import type { PublishEntryCommand, PublishEntryResult } from "./types";

export async function publishEntry(command: PublishEntryCommand): Promise<PublishEntryResult> {
  const handle = beginOperation({
    useCase: "cms.publish-entry",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findEntryById(command.id);
  if (!existing) {
    const error = { code: "cms.entries.not_found", message: `Entry "${command.id}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const entry = await markEntryPublished(command.id);

  // Invalidação é responsabilidade de quem escreve (docs/venore-docks.md — Cache).
  invalidateCacheByPrefix("cms:entries:published");

  endOperation(handle, { success: true });
  return { success: true, data: entry };
}
