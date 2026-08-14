import { isPluginActive } from "../plugin-engine/is-plugin-active";
import { getAdminPageData } from "./get-admin-page-data";
import type { AdminPageGate } from "./types";

// Loader "de seção" do admin (docs/venore-docks.md — regra 13), mesmo padrão de
// get-birthdays-page-data.ts: getAdminPageData() já resolveu o ator e o acesso geral ao admin;
// aqui só acrescenta a checagem de acesso à seção /admin/broadcast. Único gate pra UMA única rota
// (/admin/broadcast) — antes existiam get-broadcast-agenda-page-data.ts/
// get-broadcast-outputs-page-data.ts pras rotas satélite /admin/broadcast/agenda e /telas, cada
// uma com seu próprio link de navegação; consolidado num só (pedido explícito: "não separe os
// links na navegação admin") — a página agora decide sozinha, a partir de gate.actor.permissions,
// quanto do admin completo mostrar (ver page.tsx, que monta a lista de abas dinamicamente).
// Aceita QUALQUER UMA das quatro permissions do plugin — broadcast.manage (acesso total),
// broadcast.agenda.manage/broadcast.outputs.manage/broadcast.playlists.manage (acesso restrito às
// agendas/telas/playlists atribuídas, ver shared/scoped-authorization). Plugin desabilitado nega
// como "forbidden", mesmo raciocínio de get-birthdays-page-data.ts.
export async function getBroadcastPageData(): Promise<AdminPageGate> {
  const gate = await getAdminPageData();
  if (!gate.granted) {
    return gate;
  }

  if (!(await isPluginActive("broadcast"))) {
    return { granted: false, reason: "forbidden" };
  }

  const hasBroadcastAccess =
    gate.actor.isSuperadmin ||
    gate.actor.permissions.includes("broadcast.manage") ||
    gate.actor.permissions.includes("broadcast.agenda.manage") ||
    gate.actor.permissions.includes("broadcast.outputs.manage") ||
    gate.actor.permissions.includes("broadcast.playlists.manage");
  if (!hasBroadcastAccess) {
    return { granted: false, reason: "forbidden" };
  }

  return gate;
}
