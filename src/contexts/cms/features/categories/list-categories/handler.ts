// Leitura pública: catálogo de categorias, sem authorizeActor (docs/venore-docks.md — CMS).
import { listCategories } from "./service";
import type { ListCategoriesResult } from "./types";

export async function listCategoriesHandler(): Promise<ListCategoriesResult> {
  return listCategories();
}
