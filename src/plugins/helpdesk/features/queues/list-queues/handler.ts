import { resolveVisibleQueues } from "../../../shared/scoped-authorization";
import { listQueues } from "./service";
import type { ListQueuesResult } from "./types";

// helpdesk.manage / helpdesk.read → lista todas; helpdesk.work → só as filas atribuídas; nenhuma
// das três → 403.
export async function listQueuesHandler(options?: { includeArchived?: boolean }): Promise<ListQueuesResult> {
  const visible = await resolveVisibleQueues();

  if (visible.scope === "none") {
    return {
      success: false,
      error: { code: "helpdesk.list-queues.forbidden", message: "Você não tem acesso a Chamados." },
    };
  }

  return listQueues({
    includeArchived: options?.includeArchived,
    allowedQueueIds: visible.scope === "scoped" ? visible.queueIds : undefined,
  });
}
