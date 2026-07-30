import { getAdminPageData } from "./get-admin-page-data";
import type { AdminPageGate } from "./types";

// Loader "de seção" do admin (docs/venore-docks.md — regra 13), mesmo padrão de
// get-academy-page-data.ts: getAdminPageData() já resolveu o ator e o acesso geral ao admin;
// aqui só acrescenta a checagem de acesso à seção /admin/birthdays. birthdays.read já basta pra
// ver a tela — mutações (criar/editar/remover) são checadas de novo em cada handler.ts com
// birthdays.manage, a fronteira de verdade.
export async function getBirthdaysPageData(): Promise<AdminPageGate> {
  const gate = await getAdminPageData();
  if (!gate.granted) {
    return gate;
  }

  const hasBirthdaysAccess = gate.actor.isSuperadmin || gate.actor.permissions.includes("birthdays.read");
  if (!hasBirthdaysAccess) {
    return { granted: false, reason: "forbidden" };
  }

  return gate;
}
