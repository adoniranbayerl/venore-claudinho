// Leitura pública: resolução do main-nav (e outros locations futuros) pela camada de composição
// de tema, sem authorizeActor (docs/venore-docks.md — CMS). Mesmo padrão de
// get-published-entry-by-slug/handler.ts.
import { getMenuByLocation } from "./service";
import type { GetMenuByLocationQuery, GetMenuByLocationResult } from "./types";

export async function getMenuByLocationHandler(query: GetMenuByLocationQuery): Promise<GetMenuByLocationResult> {
  if (query.location.trim().length === 0) {
    return { success: false, error: { code: "cms.menus.invalid_location", message: "location não pode ser vazio." } };
  }
  return getMenuByLocation(query);
}
