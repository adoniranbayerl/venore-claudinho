import { isPluginActive } from "../plugin-engine/is-plugin-active";
import { getAdminPageData } from "./get-admin-page-data";
import type { AdminPageGate } from "./types";

// Loader "de seção" do admin (docs/venore-docks.md — regra 13), mesmo padrão de
// get-birthdays-page-data.ts: getAdminPageData() já resolveu o ator e o acesso geral ao admin;
// aqui só acrescenta a checagem de acesso à seção /admin/enrollment-dashboard. Plugin desabilitado
// nega como "forbidden" — fecha a rota pra quem digita a URL direto, o item de nav sumir não basta.
export async function getEnrollmentDashboardPageData(): Promise<AdminPageGate> {
  const gate = await getAdminPageData();
  if (!gate.granted) {
    return gate;
  }

  if (!(await isPluginActive("enrollment-dashboard"))) {
    return { granted: false, reason: "forbidden" };
  }

  const hasAccess = gate.actor.isSuperadmin || gate.actor.permissions.includes("enrollment-dashboard.read");
  if (!hasAccess) {
    return { granted: false, reason: "forbidden" };
  }

  return gate;
}
