// Leitura pública: resolução de rota /<slug> ou /<categoria>/<slug>, sem authorizeActor
// (docs/venore-docks.md — CMS).
import { getPublishedEntryBySlug } from "./service";
import type { GetPublishedEntryBySlugQuery, GetPublishedEntryBySlugResult } from "./types";

export async function getPublishedEntryBySlugHandler(
  query: GetPublishedEntryBySlugQuery,
): Promise<GetPublishedEntryBySlugResult> {
  if (query.slug.trim().length === 0) {
    return { success: false, error: { code: "cms.entries.invalid_slug", message: "slug não pode ser vazio." } };
  }
  return getPublishedEntryBySlug(query);
}
