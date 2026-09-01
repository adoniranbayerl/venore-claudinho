import type { OperationResult } from "@/shared/types";
import { beginOperation, endOperation } from "@/observability";
import { notifySlaAtRiskForTicket } from "../../../shared/notify";
import { needsSlaAtRiskAlert } from "../../../shared/sla";
import { findSlaCandidateTickets } from "./store";

export type SweepSlaAtRiskResult = OperationResult<{ created: number }>;

// Varredura de SLA (docs/chamados-plugin.md §2.4) — sem scheduler no v1 (§8: propagação em tempo
// real e jobs são Fase 8), então roda no batimento do polling de notificações
// (`GET /api/helpdesk/notifications`, ~30 s). Para cada chamado que cruzou 80 % do prazo sem
// resolução e cuja fila ainda não foi avisada, grava um `sla_at_risk`. Idempotente — o dedup mora
// em notifySlaAtRiskForTicket.
export async function sweepSlaAtRisk(): Promise<SweepSlaAtRiskResult> {
  const candidates = await findSlaCandidateTickets();
  const now = new Date();
  const atRisk = candidates.filter((ticket) =>
    needsSlaAtRiskAlert({ slaDueAt: ticket.slaDueAt, resolvedAt: ticket.resolvedAt, createdAt: ticket.createdAt }, now),
  );
  if (atRisk.length === 0) return { success: true, data: { created: 0 } };

  const handle = beginOperation({
    useCase: "helpdesk.sweep-sla-at-risk",
    actor: { id: "system", type: "system" },
    kind: "write",
  });

  let created = 0;
  for (const ticket of atRisk) {
    if (await notifySlaAtRiskForTicket(ticket)) created += 1;
  }

  endOperation(handle, { success: true });
  return { success: true, data: { created } };
}
