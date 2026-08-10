import { isPluginActive } from "../plugin-engine/is-plugin-active";
import { getAdminPageData } from "./get-admin-page-data";
import type { AdminPageGate } from "./types";

// Gate da rota separada /admin/broadcast/telas — mesmo racional de get-broadcast-agenda-page-data.ts,
// pro papel "editor de tela" (broadcast.outputs.manage) que NÃO tem broadcast.manage.
export async function getBroadcastOutputsPageData(): Promise<AdminPageGate> {
  const gate = await getAdminPageData();
  if (!gate.granted) {
    return gate;
  }

  if (!(await isPluginActive("broadcast"))) {
    return { granted: false, reason: "forbidden" };
  }

  const hasAccess =
    gate.actor.isSuperadmin ||
    gate.actor.permissions.includes("broadcast.manage") ||
    gate.actor.permissions.includes("broadcast.outputs.manage");
  if (!hasAccess) {
    return { granted: false, reason: "forbidden" };
  }

  return gate;
}
