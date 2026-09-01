import type { OperationResult } from "@/shared/types";
import { beginOperation, endOperation } from "@/observability";
import { autoCloseCutoff, TICKET_AUTO_CLOSE_DAYS } from "../../../shared/ticket-state";
import { notify } from "../../../shared/notify";
import { applyAutoClose, findResolvedTicketsPastAutoClose } from "./store";

export type SweepAutoCloseResult = OperationResult<{ closed: number }>;

// Auto-close após N dias sem reabertura (docs/chamados-plugin.md §5). Sem scheduler no v1 (§8),
// roda no batimento do polling de notificações (`GET /api/helpdesk/notifications`, ~30 s), junto
// da varredura de SLA. Idempotente: `applyAutoClose` re-checa o estado no `where`, então uma
// reabertura no meio do caminho é respeitada.
export async function sweepAutoClose(now: Date = new Date()): Promise<SweepAutoCloseResult> {
  const candidates = await findResolvedTicketsPastAutoClose(autoCloseCutoff(now));
  if (candidates.length === 0) return { success: true, data: { closed: 0 } };

  const handle = beginOperation({
    useCase: "helpdesk.sweep-auto-close",
    actor: { id: "system", type: "system" },
    kind: "write",
  });

  let closed = 0;
  for (const candidate of candidates) {
    if (!(await applyAutoClose(candidate.id, TICKET_AUTO_CLOSE_DAYS))) continue;
    closed += 1;
    // §2.3 — o solicitante fica sabendo que o chamado foi encerrado.
    await notify({
      ticketId: candidate.id,
      queueId: candidate.queueId,
      kind: "status_changed",
      text: "chamado fechado automaticamente",
      actorUserId: null,
      audiences: ["requester"],
    });
  }

  endOperation(handle, { success: true });
  return { success: true, data: { closed } };
}
