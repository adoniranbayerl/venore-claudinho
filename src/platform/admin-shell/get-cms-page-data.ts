import { getAdminPageData } from "./get-admin-page-data";
import type { AdminPageGate } from "./types";

const CMS_SECTION_PERMISSIONS = ["cms.content-types.manage", "cms.categories.manage", "cms.entries.manage"];

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

  return gate;
}
