// Leitura pública: caminho que o site consome para entries publicadas, sem authorizeActor
// (docs/venore-docks.md — CMS).
import { listEntries } from "./service";
import type { ListEntriesQuery, ListEntriesResult } from "./types";

export async function listEntriesHandler(query: ListEntriesQuery = {}): Promise<ListEntriesResult> {
  return listEntries(query);
}
