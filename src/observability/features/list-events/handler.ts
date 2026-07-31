import { listEvents as listEventsService } from "./service";
import type { ListEventsQuery, ListEventsResult } from "./types";

// observability é infraestrutura técnica, não um context de domínio — sem authorizeActor aqui.
// Quem pode ver os eventos é decidido na página admin (getDiagnosticsPageData), como as demais
// telas /admin/* (docs/venore-docks.md).
export async function listEventsHandler(query: ListEventsQuery = {}): Promise<ListEventsResult> {
  return listEventsService(query);
}
