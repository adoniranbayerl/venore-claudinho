import { listLogEntries as listLogEntriesService } from "./service";
import type { ListLogEntriesQuery, ListLogEntriesResult } from "./types";

// observability é infraestrutura técnica, não um context de domínio — sem authorizeActor aqui.
// Quem pode ver os logs é decidido na página admin (getDiagnosticsPageData), como as demais
// telas /admin/* (docs/venore-docks.md).
export async function listLogEntriesHandler(query: ListLogEntriesQuery = {}): Promise<ListLogEntriesResult> {
  return listLogEntriesService(query);
}
