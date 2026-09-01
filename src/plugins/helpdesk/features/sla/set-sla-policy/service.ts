import { beginOperation, endOperation } from "@/observability";
import { findQueueById } from "../../../shared/scoped-authorization/store";
import { upsertSlaPolicy } from "../../../shared/sla-policy-store";
import type { SetSlaPolicyCommand, SetSlaPolicyResult } from "./types";

// Grava (upsert) a política de SLA de uma (fila, prioridade) — §2.4. Não recalcula `sla_due_at`
// dos chamados já abertos: o prazo vigente de um chamado é o que foi carimbado na abertura / no
// último priority_change (v1). A nova política vale para os próximos chamados e priority_changes.
export async function setSlaPolicy(command: SetSlaPolicyCommand): Promise<SetSlaPolicyResult> {
  const queue = await findQueueById(command.queueId);
  if (!queue) {
    return { success: false, error: { code: "helpdesk.set-sla-policy.queue_not_found", message: "Fila não encontrada." } };
  }

  const handle = beginOperation({
    useCase: "helpdesk.set-sla-policy",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const record = await upsertSlaPolicy({
    queueId: command.queueId,
    priority: command.priority,
    firstResponseMinutes: command.firstResponseMinutes,
    resolutionMinutes: command.resolutionMinutes,
  });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
