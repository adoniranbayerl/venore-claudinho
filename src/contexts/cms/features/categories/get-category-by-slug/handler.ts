// Leitura pública: resolução de rota /<categoria>/<slug>, sem authorizeActor (docs/venore-docks.md — CMS).
import { getCategoryBySlug } from "./service";
import type { GetCategoryBySlugQuery, GetCategoryBySlugResult } from "./types";

export async function getCategoryBySlugHandler(query: GetCategoryBySlugQuery): Promise<GetCategoryBySlugResult> {
  if (query.slug.trim().length === 0) {
    return { success: false, error: { code: "cms.categories.invalid_slug", message: "slug não pode ser vazio." } };
  }
  return getCategoryBySlug(query);
}
