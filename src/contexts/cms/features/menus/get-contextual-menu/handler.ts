import { getContextualMenu } from "./service";
import type { GetContextualMenuQuery, GetContextualMenuResult } from "./types";

// Leitura pública, sem authorizeActor — mesmo padrão de get-menu-by-location.
export async function getContextualMenuHandler(query: GetContextualMenuQuery): Promise<GetContextualMenuResult> {
  if (query.path.trim().length === 0) {
    return { success: false, error: { code: "cms.menus.invalid_path", message: "path não pode ser vazio." } };
  }

  return getContextualMenu(query);
}
