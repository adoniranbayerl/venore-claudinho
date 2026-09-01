import { authorizeQueueConfigActor } from "../../../shared/scoped-authorization";
import { listQueueMembers } from "./service";
import type { ListQueueMembersResult } from "./types";

export async function listQueueMembersHandler(queueId: string): Promise<ListQueueMembersResult> {
  if (!queueId || queueId.trim().length === 0) {
    return { success: false, error: { code: "helpdesk.list-queue-members.missing_queue", message: "Fila não informada." } };
  }

  const authz = await authorizeQueueConfigActor(queueId);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listQueueMembers(queueId);
}
