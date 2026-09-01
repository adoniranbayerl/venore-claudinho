import { TICKET_PRIORITIES } from "../../../contracts/types";
import { DEFAULT_SLA_MINUTES } from "../../../shared/sla";
import { findSlaPoliciesForQueue } from "../../../shared/sla-policy-store";
import type { ListSlaPoliciesResult, SlaPolicyRow } from "./types";

// Sempre devolve as quatro prioridades — a fila que não configurou uma prioridade mostra o padrão
// corrido de shared/sla.ts, marcado como `source: "default"`.
export async function listSlaPolicies(queueId: string): Promise<ListSlaPoliciesResult> {
  const raw = await findSlaPoliciesForQueue(queueId);
  const byPriority = new Map(raw.map((row) => [row.priority, row]));

  const rows: SlaPolicyRow[] = TICKET_PRIORITIES.map((priority) => {
    const configured = byPriority.get(priority);
    if (configured) {
      return {
        priority,
        firstResponseMinutes: configured.firstResponseMinutes,
        resolutionMinutes: configured.resolutionMinutes,
        source: "policy",
      };
    }
    return {
      priority,
      firstResponseMinutes: DEFAULT_SLA_MINUTES[priority].firstResponseMinutes,
      resolutionMinutes: DEFAULT_SLA_MINUTES[priority].resolutionMinutes,
      source: "default",
    };
  });

  return { success: true, data: { queueId, rows, raw } };
}
