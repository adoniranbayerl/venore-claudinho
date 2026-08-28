import { isPluginActive } from "../plugin-engine/is-plugin-active";
import { getAdminPageData } from "./get-admin-page-data";
import type { AdminPageGate } from "./types";

// Loader "de seção" do admin (docs/venore-docks.md — regra 13), mesmo padrão de
// get-broadcast-page-data.ts: getAdminPageData() já resolveu o ator e o acesso geral ao admin;
// aqui só acrescenta a checagem de acesso à seção /admin/company-metrics. Aceita
// company-metrics.manage (acesso total) OU company-metrics.contribute (só os setores atribuídos,
// ver shared/scoped-authorization). company-metrics.read sozinho NÃO entra aqui — quem só lê usa
// /metricas (Fase 4). Plugin desabilitado nega como "forbidden".
export async function getCompanyMetricsPageData(): Promise<AdminPageGate> {
  const gate = await getAdminPageData();
  if (!gate.granted) {
    return gate;
  }

  if (!(await isPluginActive("company-metrics"))) {
    return { granted: false, reason: "forbidden" };
  }

  const hasAccess =
    gate.actor.isSuperadmin ||
    gate.actor.permissions.includes("company-metrics.manage") ||
    gate.actor.permissions.includes("company-metrics.contribute");
  if (!hasAccess) {
    return { granted: false, reason: "forbidden" };
  }

  return gate;
}
