import { getAdminPageData } from "./get-admin-page-data";
import type { AdminPageGate } from "./types";

// Loader "de seção" do admin (docs/venore-docks.md — regra 13), mesmo papel de
// get-diagnostics-page-data.ts: getAdminPageData() já resolveu o ator e o acesso geral ao admin;
// aqui só acrescenta a checagem de acesso à seção /admin/media, atrás da permission media.manage.
export async function getMediaPageData(): Promise<AdminPageGate> {
  const gate = await getAdminPageData();
  if (!gate.granted) {
    return gate;
  }

  const hasMediaAccess = gate.actor.isSuperadmin || gate.actor.permissions.includes("media.manage");
  if (!hasMediaAccess) {
    return { granted: false, reason: "forbidden" };
  }

  return gate;
}
