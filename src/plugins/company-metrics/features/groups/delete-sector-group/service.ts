import { beginOperation, endOperation } from "@/observability";
import { deleteSectorGroupById, findSectorGroupById } from "./store";
import type { DeleteSectorGroupCommand, DeleteSectorGroupResult } from "./types";

export async function deleteSectorGroup(command: DeleteSectorGroupCommand): Promise<DeleteSectorGroupResult> {
  const existing = await findSectorGroupById(command.groupId);
  if (!existing) {
    return { success: false, error: { code: "company-metrics.delete-sector-group.not_found", message: "Grupo não encontrado." } };
  }

  const handle = beginOperation({
    useCase: "company-metrics.delete-sector-group",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  await deleteSectorGroupById(command.groupId);

  endOperation(handle, { success: true });
  return { success: true, data: { groupId: command.groupId } };
}
