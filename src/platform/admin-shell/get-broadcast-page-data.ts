import { isPluginActive } from "../plugin-engine/is-plugin-active";
import { getAdminPageData } from "./get-admin-page-data";
import type { AdminPageGate } from "./types";

// Loader "de seção" do admin (docs/venore-docks.md — regra 13), mesmo padrão de
// get-birthdays-page-data.ts: getAdminPageData() já resolveu o ator e o acesso geral ao admin;
// aqui só acrescenta a checagem de acesso à seção /admin/broadcast. broadcast.manage é a única
// permission do plugin (mutações e leitura compartilham a mesma fronteira aqui, diferente de
// birthdays que separa read/manage — não há um caso de uso "só ver, nunca operar" pro painel de
// broadcast). Plugin desabilitado nega como "forbidden", mesmo raciocínio de
// get-birthdays-page-data.ts.
export async function getBroadcastPageData(): Promise<AdminPageGate> {
  const gate = await getAdminPageData();
  if (!gate.granted) {
    return gate;
  }

  if (!(await isPluginActive("broadcast"))) {
    return { granted: false, reason: "forbidden" };
  }

  const hasBroadcastAccess = gate.actor.isSuperadmin || gate.actor.permissions.includes("broadcast.manage");
  if (!hasBroadcastAccess) {
    return { granted: false, reason: "forbidden" };
  }

  return gate;
}
