import { isPluginActive } from "../plugin-engine/is-plugin-active";
import { getAdminPageData } from "./get-admin-page-data";
import type { AdminPageGate } from "./types";

// Gate da rota separada /admin/broadcast/agenda — pro papel "editor de agenda"
// (broadcast.agenda.manage) que NÃO tem broadcast.manage (senão usaria a aba "Agenda" dentro do
// admin completo em /admin/broadcast). Mesmo formato de getBroadcastPageData, só a permission
// aceita muda — nunca reaproveita aquele porque ali exige broadcast.manage sozinho.
export async function getBroadcastAgendaPageData(): Promise<AdminPageGate> {
  const gate = await getAdminPageData();
  if (!gate.granted) {
    return gate;
  }

  if (!(await isPluginActive("broadcast"))) {
    return { granted: false, reason: "forbidden" };
  }

  const hasAccess =
    gate.actor.isSuperadmin || gate.actor.permissions.includes("broadcast.manage") || gate.actor.permissions.includes("broadcast.agenda.manage");
  if (!hasAccess) {
    return { granted: false, reason: "forbidden" };
  }

  return gate;
}
