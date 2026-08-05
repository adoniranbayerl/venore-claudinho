import { isPluginActive } from "../plugin-engine/is-plugin-active";
import { getAdminPageData } from "./get-admin-page-data";
import type { AdminPageGate } from "./types";

// Loader "de seção" do admin (docs/venore-docks.md — regra 13), mesmo padrão de
// get-cms-page-data.ts: getAdminPageData() já resolveu o ator e o acesso geral ao admin; aqui só
// acrescenta a checagem de acesso à seção /admin/academy. Plugin desabilitado nega como
// "forbidden" — mesmo efeito de não ter a permission, e fecha a rota pra quem digita a URL direto
// (o item de nav já some via registerPlugins(), mas isso nunca bastou pra proteger a rota).
export async function getAcademyPageData(): Promise<AdminPageGate> {
  const gate = await getAdminPageData();
  if (!gate.granted) {
    return gate;
  }

  if (!(await isPluginActive("academy"))) {
    return { granted: false, reason: "forbidden" };
  }

  const hasAcademyAccess = gate.actor.isSuperadmin || gate.actor.permissions.includes("academy.courses.manage");
  if (!hasAcademyAccess) {
    return { granted: false, reason: "forbidden" };
  }

  return gate;
}
