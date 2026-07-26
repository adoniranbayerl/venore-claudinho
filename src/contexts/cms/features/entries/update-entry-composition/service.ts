import { beginOperation, endOperation } from "@/observability";
import { compositionSchema } from "../../../contracts/block";
import { validateComposition } from "../../../validate-composition";
import { findEntryById, saveEntryComposition } from "./store";
import type { UpdateEntryCompositionCommand, UpdateEntryCompositionResult } from "./types";

export async function updateEntryComposition(
  command: UpdateEntryCompositionCommand,
): Promise<UpdateEntryCompositionResult> {
  const handle = beginOperation({
    useCase: "cms.update-entry-composition",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findEntryById(command.id);
  if (!existing) {
    const error = { code: "cms.entries.not_found", message: `Entry "${command.id}" não encontrada.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const parsed = compositionSchema.safeParse(command.composition);
  if (!parsed.success) {
    const error = { code: "cms.composition.invalid_shape", message: "A composição enviada não tem o formato esperado." };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const validation = validateComposition(parsed.data, command.resolveDefinition);
  if (!validation.valid) {
    const [first] = validation.errors;
    endOperation(handle, { success: false, error: first });
    return { success: false, error: { code: first.code, message: first.message } };
  }

  const existingData = existing.data && typeof existing.data === "object" ? (existing.data as Record<string, unknown>) : {};
  const entry = await saveEntryComposition(command.id, { ...existingData, blocks: parsed.data });

  endOperation(handle, { success: true });
  return { success: true, data: entry };
}
