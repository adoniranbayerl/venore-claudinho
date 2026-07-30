import { resolveMediaActorScope } from "../../../resolve-media-actor-scope";
import { listCategories } from "./service";
import type { ListCategoriesResult } from "./types";

// Categoria não é dado sensível por ator (ao contrário de visibility de arquivo) — mesmo
// gate de sessão dos outros handlers de media só pra não responder nada a quem não está
// autenticado, não porque a lista em si precise de escopo por usuário.
export async function listCategoriesHandler(): Promise<ListCategoriesResult> {
  const scope = await resolveMediaActorScope();
  if (!scope) {
    return { success: true, data: [] };
  }

  return listCategories();
}
