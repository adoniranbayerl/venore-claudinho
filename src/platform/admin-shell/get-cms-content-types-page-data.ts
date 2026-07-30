import { getAdminPageData } from "./get-admin-page-data";
import type { AdminPageGate } from "./types";

// Loader "de seção" do admin (docs/venore-docks.md — regra 13), mesmo papel de
// get-cms-page-data.ts, mas específico da rota /admin/cms/content-types: exige a permission de
// tipos de conteúdo diretamente, em vez do OR-gate amplo das demais telas de CMS.
export async function getCmsContentTypesPageData(): Promise<AdminPageGate> {
  const gate = await getAdminPageData();
  if (!gate.granted) {
    return gate;
  }

  const hasContentTypesAccess = gate.actor.isSuperadmin || gate.actor.permissions.includes("cms.content-types.manage");
  if (!hasContentTypesAccess) {
    return { granted: false, reason: "forbidden" };
  }

  return gate;
}
