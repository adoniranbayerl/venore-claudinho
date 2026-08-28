import { beginOperation, endOperation } from "@/observability";
import { findSectorGroupById, updateSectorGroupRow } from "./store";
import type { UpdateSectorGroupCommand, UpdateSectorGroupResult } from "./types";

// key não é tocada (é slug estável, mesmo racional de sectors.key).
export async function updateSectorGroup(command: UpdateSectorGroupCommand): Promise<UpdateSectorGroupResult> {
  const existing = await findSectorGroupById(command.groupId);
  if (!existing) {
    return { success: false, error: { code: "company-metrics.update-sector-group.not_found", message: "Grupo não encontrado." } };
  }
  if (command.label.trim().length === 0) {
    return { success: false, error: { code: "company-metrics.update-sector-group.invalid_label", message: "O nome do grupo não pode ser vazio." } };
  }

  const handle = beginOperation({
    useCase: "company-metrics.update-sector-group",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const record = await updateSectorGroupRow(command.groupId, {
    label: command.label.trim(),
    logoMediaId: command.logoMediaId?.trim() || null,
  });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
