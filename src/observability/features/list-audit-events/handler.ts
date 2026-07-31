import { listAuditEvents as listAuditEventsService } from "./service";
import type { ListAuditEventsQuery, ListAuditEventsResult } from "./types";

// Mesmo padrão de list-events: acesso é decidido na página admin
// (getDiagnosticsAuditPageData, atrás de "observability.audit.view"), não aqui.
export async function listAuditEventsHandler(query: ListAuditEventsQuery = {}): Promise<ListAuditEventsResult> {
  return listAuditEventsService(query);
}
