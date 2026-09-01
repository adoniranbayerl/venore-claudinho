import { isPluginActive } from "../plugin-engine/is-plugin-active";
import { getAdminPageData } from "./get-admin-page-data";
import type { AdminPageGate } from "./types";

// Loader "de seção" do admin (docs/venore-docks.md — regra 13), mesmo padrão de
// get-company-metrics-page-data.ts: getAdminPageData() já resolveu o ator e o acesso geral ao
// admin; aqui só acrescenta a checagem de acesso à seção /admin/helpdesk. Aceita helpdesk.manage,
// helpdesk.work (só as filas atribuídas) OU helpdesk.read (acompanha sem agir). Plugin
// desabilitado nega como "forbidden".
export async function getHelpdeskPageData(): Promise<AdminPageGate> {
  const gate = await getAdminPageData();
  if (!gate.granted) {
    return gate;
  }

  if (!(await isPluginActive("helpdesk"))) {
    return { granted: false, reason: "forbidden" };
  }

  const hasAccess =
    gate.actor.isSuperadmin ||
    gate.actor.permissions.includes("helpdesk.manage") ||
    gate.actor.permissions.includes("helpdesk.work") ||
    gate.actor.permissions.includes("helpdesk.read");
  if (!hasAccess) {
    return { granted: false, reason: "forbidden" };
  }

  return gate;
}
