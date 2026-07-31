import { getAdminPageData } from "./get-admin-page-data";
import type { AdminPageGate } from "./types";

// Loader "de seção" análogo a get-diagnostics-page-data.ts, mas atrás de
// "observability.audit.view" — permission distinta de "observability.logs.view" de propósito:
// auditoria de segurança é mais sensível que o log operacional (FASE 1, decisão confirmada com o
// usuário), então quem vê um não necessariamente vê o outro.
export async function getDiagnosticsAuditPageData(): Promise<AdminPageGate> {
  const gate = await getAdminPageData();
  if (!gate.granted) {
    return gate;
  }

  const hasAuditAccess = gate.actor.isSuperadmin || gate.actor.permissions.includes("observability.audit.view");
  if (!hasAuditAccess) {
    return { granted: false, reason: "forbidden" };
  }

  return gate;
}
