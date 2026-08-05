import { isPluginActive } from "../plugin-engine/is-plugin-active";
import { getAdminPageData } from "./get-admin-page-data";
import type { AdminPageGate } from "./types";

// Loader "de seção" do admin (docs/venore-docks.md — regra 13), mesmo padrão de
// get-birthdays-page-data.ts: getAdminPageData() já resolveu o ator e o acesso geral ao admin;
// aqui só acrescenta a checagem de acesso à seção /admin/donations. donations.manage já basta pra
// ver a tela (não existe uma "donations.read" separada — sem CRUD de registros, é uma única tela
// de configuração). Plugin desabilitado nega como "forbidden", fechando a rota pra quem digita a
// URL direto.
export async function getDonationsPageData(): Promise<AdminPageGate> {
  const gate = await getAdminPageData();
  if (!gate.granted) {
    return gate;
  }

  if (!(await isPluginActive("donations"))) {
    return { granted: false, reason: "forbidden" };
  }

  const hasDonationsAccess = gate.actor.isSuperadmin || gate.actor.permissions.includes("donations.manage");
  if (!hasDonationsAccess) {
    return { granted: false, reason: "forbidden" };
  }

  return gate;
}
