import { authorizeActor, resolveScopeForActor } from "@/contexts/rbac";
import { listCategoriesForAdmin } from "./service";
import type { ListCategoriesForAdminResult } from "./types";

// Keys que o CMS category scope recorta (RBAC_SCOPE_TYPES → "cms.category"). O editor tem a
// permission escopada nas três; a tela de admin de categorias e o seletor de categoria nas
// telas de edição de entry usam este caminho (o public list-categories não é gateado).
const CATEGORY_SCOPE_KEYS = ["cms.categories.manage", "cms.entries.manage"] as const;

export async function listCategoriesForAdminHandler(): Promise<ListCategoriesForAdminResult> {
  const authz = await authorizeActor([...CATEGORY_SCOPE_KEYS]);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  // Fase C: alguma key global → catálogo inteiro; senão a união dos ids escopados.
  let anyGlobal = false;
  const scopedIds = new Set<string>();
  for (const key of CATEGORY_SCOPE_KEYS) {
    const scope = await resolveScopeForActor(authz.actorId, key, "cms.category");
    if (scope.kind === "global") {
      anyGlobal = true;
    } else if (scope.kind === "scoped") {
      for (const id of scope.resourceIds) scopedIds.add(id);
    }
  }

  return listCategoriesForAdmin(anyGlobal ? {} : { allowedCategoryIds: [...scopedIds] });
}
