import { getAdminPageData } from "./get-admin-page-data";
import type { AdminPageGate } from "./types";

// Loader "de seção" do admin (docs/venore-docks.md — regra 13), mesmo padrão de
// get-cms-page-data.ts: getAdminPageData() já resolveu o ator e o acesso geral ao admin; aqui só
// acrescenta a checagem de acesso à seção /admin/academy.
export async function getAcademyPageData(): Promise<AdminPageGate> {
  const gate = await getAdminPageData();
  if (!gate.granted) {
    return gate;
  }

  const hasAcademyAccess = gate.actor.isSuperadmin || gate.actor.permissions.includes("academy.courses.manage");
  if (!hasAcademyAccess) {
    return { granted: false, reason: "forbidden" };
  }

  return gate;
}
