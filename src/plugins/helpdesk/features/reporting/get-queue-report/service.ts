import { beginOperation, endOperation } from "@/observability";
import { findReportQueues, findReportTicketFacts } from "./store";
import { buildQueueReport } from "./view";
import type { GetQueueReportResult } from "./types";

// O acesso já foi checado no handler (resolveVisibleQueues). `allowedQueueIds` undefined = ator vê
// todas as filas (helpdesk.manage / helpdesk.read); array = só essas (helpdesk.work).
export async function getQueueReport(options: { allowedQueueIds?: string[] } = {}): Promise<GetQueueReportResult> {
  const handle = beginOperation({
    useCase: "helpdesk.get-queue-report",
    actor: { id: "system", type: "system" },
    kind: "read",
  });

  const [queueRows, facts] = await Promise.all([
    findReportQueues(options.allowedQueueIds),
    findReportTicketFacts(options.allowedQueueIds),
  ]);

  const report = buildQueueReport(queueRows, facts);

  endOperation(handle, { success: true });
  return { success: true, data: report };
}
