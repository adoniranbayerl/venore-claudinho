import { authorizeQueueViewActor } from "../../../shared/scoped-authorization";
import { listSlaPolicies } from "./service";
import type { ListSlaPoliciesResult } from "./types";

// Ver o SLA de uma fila = quem enxerga a fila (helpdesk.manage/read, ou helpdesk.work membro).
export async function listSlaPoliciesHandler(queueId: string): Promise<ListSlaPoliciesResult> {
  if (!queueId || queueId.trim().length === 0) {
    return { success: false, error: { code: "helpdesk.list-sla-policies.missing_queue", message: "Fila não informada." } };
  }

  const authz = await authorizeQueueViewActor(queueId);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listSlaPolicies(queueId);
}
