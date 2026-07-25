import { getAdminPageData } from "./get-admin-page-data";
import type { AdminPageGate } from "./types";

// Loader "de seção" do admin (docs/venore-docks.md — regra 13), mesmo papel de get-cms-page-data.ts:
// getAdminPageData() já resolveu o ator e o acesso geral ao admin; aqui só acrescenta a checagem
// de acesso às seções /admin/settings e /admin/themes, ambas atrás da permission settings.manage.
export async function getSettingsPageData(): Promise<AdminPageGate> {
  const gate = await getAdminPageData();
  if (!gate.granted) {
    return gate;
  }

  const hasSettingsAccess = gate.actor.isSuperadmin || gate.actor.permissions.includes("settings.manage");
  if (!hasSettingsAccess) {
    return { granted: false, reason: "forbidden" };
  }

  return gate;
}
