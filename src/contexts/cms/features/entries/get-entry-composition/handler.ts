// Leitura pública, sem authorizeActor — mesmo padrão de get-entry (docs/venore-docks.md — CMS).
import { getEntryComposition } from "./service";
import type { GetEntryCompositionQuery, GetEntryCompositionResult } from "./types";

export async function getEntryCompositionHandler(query: GetEntryCompositionQuery): Promise<GetEntryCompositionResult> {
  if (query.id.trim().length === 0) {
    return { success: false, error: { code: "cms.entries.invalid_id", message: "id não pode ser vazio." } };
  }
  return getEntryComposition(query);
}
