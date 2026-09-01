import { beginOperation, endOperation } from "@/observability";
import { findQueueById, updateQueueRow } from "./store";
import type { UpdateQueueCommand, UpdateQueueResult } from "./types";

export async function updateQueue(command: UpdateQueueCommand): Promise<UpdateQueueResult> {
  const existing = await findQueueById(command.queueId);
  if (!existing) {
    return { success: false, error: { code: "helpdesk.update-queue.not_found", message: "Fila não encontrada." } };
  }

  const handle = beginOperation({
    useCase: "helpdesk.update-queue",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const record = await updateQueueRow(command.queueId, {
    name: command.name.trim(),
    description: command.description?.trim() || null,
    icon: command.icon?.trim() || null,
    defaultPriority: command.defaultPriority,
  });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
