import { getAdminPageData } from "./get-admin-page-data";
import type { AdminPageGate } from "./types";

// Primeiro loader "de seção" do admin (docs/venore-docks.md — regra 13): getAdminPageData() já
// resolveu o ator e o acesso geral ao admin; aqui só acrescenta a checagem da permission
// específica da seção /admin/rbac, sem duplicar autenticação nem a checagem geral.
export async function getRbacPageData(): Promise<AdminPageGate> {
  const gate = await getAdminPageData();
  if (!gate.granted) {
    return gate;
  }

  const hasRbacAccess = gate.actor.isSuperadmin || gate.actor.permissions.includes("rbac.roles.manage");
  if (!hasRbacAccess) {
    return { granted: false, reason: "forbidden" };
  }

  return gate;
}
