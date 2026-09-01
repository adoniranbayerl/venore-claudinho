import { authorizeActor } from "@/contexts/rbac";
import { archiveQueue } from "./service";
import type { ArchiveQueueInput, ArchiveQueueResult } from "./types";

export async function archiveQueueHandler(input: ArchiveQueueInput): Promise<ArchiveQueueResult> {
  if (!input.queueId || input.queueId.trim().length === 0) {
    return { success: false, error: { code: "helpdesk.archive-queue.missing_queue", message: "Fila não informada." } };
  }

  const authz = await authorizeActor("helpdesk.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return archiveQueue({ ...input, actorId: authz.actorId });
}
