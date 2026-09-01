import { beginOperation, endOperation } from "@/observability";
import { findQueueById, setQueueArchived } from "./store";
import type { ArchiveQueueCommand, ArchiveQueueResult } from "./types";

export async function archiveQueue(command: ArchiveQueueCommand): Promise<ArchiveQueueResult> {
  const existing = await findQueueById(command.queueId);
  if (!existing) {
    return { success: false, error: { code: "helpdesk.archive-queue.not_found", message: "Fila não encontrada." } };
  }

  const handle = beginOperation({
    useCase: "helpdesk.archive-queue",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const record = await setQueueArchived(command.queueId, command.archived ? new Date() : null);

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
