import { resolveVisibleQueues } from "../../../shared/scoped-authorization";
import { getQueueReport } from "./service";
import type { GetQueueReportResult } from "./types";

// Aba `Relatório` do /admin/helpdesk (§7). Só leitura: helpdesk.manage / helpdesk.read veem todas
// as filas; helpdesk.work vê só as filas em que é membro; nenhuma das três → 403. Mesmo recorte de
// list-tickets.
export async function getQueueReportHandler(): Promise<GetQueueReportResult> {
  const visible = await resolveVisibleQueues();
  if (visible.scope === "none") {
    return {
      success: false,
      error: { code: "helpdesk.get-queue-report.forbidden", message: "Você não tem acesso a Chamados." },
    };
  }

  return getQueueReport({
    allowedQueueIds: visible.scope === "scoped" ? visible.queueIds : undefined,
  });
}
