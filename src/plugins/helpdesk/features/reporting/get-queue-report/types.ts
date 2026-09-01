import type { OperationResult } from "@/shared/types";
import type { QueueReport } from "../../../contracts/types";

// Fase 7 (docs/chamados-plugin.md §7) — a aba `Relatório` do /admin/helpdesk. `QueueReport` /
// `QueueReportRow` (o shape que a UI consome) moram em contracts/types.ts; aqui fica só o
// resultado da feature e o fato interno que o store devolve para a agregação de view.ts.
export type GetQueueReportResult = OperationResult<QueueReport>;

// Fato mínimo por chamado que o relatório agrega (o store devolve isto; view.ts soma). Fora do
// TicketRecord de propósito: o relatório só precisa destes campos e nunca de uma linha inteira.
export type QueueReportTicketFact = {
  queueId: string;
  status: string;
  createdAt: Date;
  resolvedAt: Date | null;
  slaDueAt: Date | null;
  ratingScore: number | null;
};
