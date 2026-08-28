import { getAdminPageData } from "./get-admin-page-data";
import type { AdminPageGate } from "./types";

// Loader "de seção" do admin (docs/venore-docks.md — regra 13), mesmo papel de
// get-media-page-data.ts: getAdminPageData() já resolveu o ator e o acesso geral ao admin; aqui
// só acrescenta a checagem de acesso à seção /admin/plugins, atrás de `platform.extensions.manage`
// — a mesma permission que instalar/desabilitar/semear plugin já exige (install-plugin.ts,
// uninstall-plugin.ts, seed-plugin.ts, o action de toggle). Fase D de docs/rbac-scoped-roles.md:
// um "admin de seção" (papel custom com só o subconjunto de `*.manage` da sua seção) não passa
// aqui e não vê o item de nav, sem precisar de um scopeType `admin.section`.
export async function getPluginsPageData(): Promise<AdminPageGate> {
  const gate = await getAdminPageData();
  if (!gate.granted) {
    return gate;
  }

  const hasExtensionsAccess =
    gate.actor.isSuperadmin || gate.actor.permissions.includes("platform.extensions.manage");
  if (!hasExtensionsAccess) {
    return { granted: false, reason: "forbidden" };
  }

  return gate;
}
