import { getAdminPageData } from "./get-admin-page-data";
import type { AdminPageGate } from "./types";

// Loader "de seção" do admin (docs/venore-docks.md — regra 13), mesmo papel de
// get-settings-page-data.ts: getAdminPageData() já resolveu o ator e o acesso geral ao admin;
// aqui só acrescenta a checagem de acesso à seção /admin/diagnostics, atrás da permission
// observability.logs.view.
export async function getDiagnosticsPageData(): Promise<AdminPageGate> {
  const gate = await getAdminPageData();
  if (!gate.granted) {
    return gate;
  }

  const hasDiagnosticsAccess = gate.actor.isSuperadmin || gate.actor.permissions.includes("observability.logs.view");
  if (!hasDiagnosticsAccess) {
    return { granted: false, reason: "forbidden" };
  }

  return gate;
}

export function canClearDiagnosticsEvents(actor: { isSuperadmin: boolean; permissions: string[] }): boolean {
  return actor.isSuperadmin || actor.permissions.includes("observability.logs.clear");
}
