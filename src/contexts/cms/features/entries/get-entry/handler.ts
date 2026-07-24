// Leitura pública: caminho que o site consome para entries publicadas, sem authorizeActor
// (docs/venore-docks.md — CMS).
import { getEntry } from "./service";
import type { GetEntryQuery, GetEntryResult } from "./types";

export async function getEntryHandler(query: GetEntryQuery): Promise<GetEntryResult> {
  if (query.id.trim().length === 0) {
    return { success: false, error: { code: "cms.entries.invalid_id", message: "id não pode ser vazio." } };
  }
  return getEntry(query);
}
