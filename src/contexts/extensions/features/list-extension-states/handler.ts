// Leitura pública, sem authorizeActor — mesma justificativa de get-extension-state/handler.ts:
// consumida no bootstrap do motor de plugins e na resolução de tema, sem ator humano.
import { listExtensionStates } from "./service";
import type { ListExtensionStatesQuery, ListExtensionStatesResult } from "./types";

export async function listExtensionStatesHandler(query: ListExtensionStatesQuery): Promise<ListExtensionStatesResult> {
  return listExtensionStates(query);
}
