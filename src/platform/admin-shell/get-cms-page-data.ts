import { resolveScopeForActor } from "@/contexts/rbac";
import { getAdminPageData } from "./get-admin-page-data";
import type { AdminPageGate } from "./types";

const CMS_SECTION_PERMISSIONS = [
  "cms.content-types.manage",
  "cms.categories.manage",
  "cms.entries.manage",
  "cms.menus.manage",
];

// Loader "de seção" do admin (docs/venore-docks.md — regra 13): getAdminPageData() já resolveu o
// ator e o acesso geral ao admin; aqui só acrescenta a checagem de acesso à seção /admin/cms.
// A página existe se o ator tiver QUALQUER UMA das permissions de CMS — cada seção dentro dela
// (content types, categorias, entries) se mostra/esconde conforme a permission específica.
export async function getCmsPageData(): Promise<AdminPageGate> {
  const gate = await getAdminPageData();
  if (!gate.granted) {
    return gate;
  }

  const hasCmsAccess =
    gate.actor.isSuperadmin || CMS_SECTION_PERMISSIONS.some((permission) => gate.actor.permissions.includes(permission));
  if (!hasCmsAccess) {
    return { granted: false, reason: "forbidden" };
  }

  // Fase C (docs/rbac-scoped-roles.md §4.3): anexa o resumo do escopo de categoria do ator pras
  // telas de CMS não recomputarem. A liberação da SEÇÃO continua acima (qualquer cms.*.manage); o
  // recorte é dentro das telas. Objeto novo — o gate de getAdminPageData é memoizado por request.
  // "scoped" → os ids; "global" → sem recorte; "none" (entrou na seção por outra permission de
  // CMS, ex: cms.menus.manage, sem cms.entries.manage) → [] (não enxerga entry nenhuma).
  const scope = await resolveScopeForActor(gate.actor.id, "cms.entries.manage", "cms.category");
  const cmsCategoryScope: "global" | string[] =
    scope.kind === "global" ? "global" : scope.kind === "scoped" ? scope.resourceIds : [];

  return { granted: true, actor: { ...gate.actor, cmsCategoryScope } };
}
