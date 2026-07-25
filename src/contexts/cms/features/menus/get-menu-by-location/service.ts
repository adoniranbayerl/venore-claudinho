import { findMenuByLocation, findMenuItemsByMenuId } from "./store";
import type { GetMenuByLocationQuery, GetMenuByLocationResult } from "./types";

// Se a location ainda não tem um menu no banco, devolvemos um menu vazio sem persistir nada —
// esta é uma rota de leitura pública (chamada pela renderização da shell a cada request), então
// criar linha aqui a transformaria num side effect de GET. O menu só passa a existir de fato
// quando a tela admin cria o primeiro item (create-menu-item cria o menu sob demanda).
export async function getMenuByLocation(query: GetMenuByLocationQuery): Promise<GetMenuByLocationResult> {
  const menu = await findMenuByLocation(query.location);
  if (!menu) {
    return { success: true, data: { location: query.location, items: [] } };
  }

  const items = await findMenuItemsByMenuId(menu.id);
  return { success: true, data: { location: query.location, items } };
}
