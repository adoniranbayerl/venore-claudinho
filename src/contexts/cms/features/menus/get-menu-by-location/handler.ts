import { getMenuByLocation } from "./service";
import type { GetMenuByLocationQuery, GetMenuByLocationResult } from "./types";

const PUBLIC_LOCATIONS = ["main", "header", "sitemap"] as const;

// Leitura pública, sem authorizeActor — o próprio resultado já é filtrado (conteúdo publicado,
// visibilidade, permission de item "route") em service.ts.
export async function getMenuByLocationHandler(query: GetMenuByLocationQuery): Promise<GetMenuByLocationResult> {
  if (!PUBLIC_LOCATIONS.includes(query.location)) {
    return {
      success: false,
      error: { code: "cms.menus.invalid_location", message: `Location "${query.location}" não é resolvível por location.` },
    };
  }

  return getMenuByLocation(query);
}
