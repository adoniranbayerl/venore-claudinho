import { beginOperation, endOperation } from "@/observability";
import { deleteTargetById, findTargetById } from "./store";
import type { DeleteTargetCommand, DeleteTargetResult } from "./types";

export async function deleteTarget(command: DeleteTargetCommand): Promise<DeleteTargetResult> {
  const existing = await findTargetById(command.targetId);
  if (!existing) {
    return { success: false, error: { code: "company-metrics.delete-target.not_found", message: "Meta não encontrada." } };
  }

  const handle = beginOperation({
    useCase: "company-metrics.delete-target",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  await deleteTargetById(command.targetId);

  endOperation(handle, { success: true });
  return { success: true, data: { targetId: command.targetId } };
}
