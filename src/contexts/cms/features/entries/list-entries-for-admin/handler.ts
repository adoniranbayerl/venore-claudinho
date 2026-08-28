import { authorizeActor, resolveScopeForActor } from "@/contexts/rbac";
import { listEntriesForAdmin } from "./service";
import type { ListEntriesForAdminQuery, ListEntriesForAdminResult } from "./types";

// Leitura administrativa: diferente de list-entries (público, só published), esta lista entries
// de qualquer status e por isso exige cms.entries.manage (docs/venore-docks.md — CMS).
export async function listEntriesForAdminHandler(
  query: ListEntriesForAdminQuery = {},
): Promise<ListEntriesForAdminResult> {
  const authz = await authorizeActor("cms.entries.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  // Fase C (docs/rbac-scoped-roles.md §4.3): editor/author escopado só enxerga as categorias
  // atribuídas. global → sem recorte; scoped → injeta os ids (entry sem categoria fica de fora);
  // none → 403 como antes.
  const scope = await resolveScopeForActor(authz.actorId, "cms.entries.manage", "cms.category");
  if (scope.kind === "none") {
    return {
      success: false,
      error: { code: "rbac.authorization.forbidden", message: 'Ator não tem a permission "cms.entries.manage".' },
    };
  }

  return listEntriesForAdmin({
    ...query,
    allowedCategoryIds: scope.kind === "scoped" ? scope.resourceIds : undefined,
  });
}
