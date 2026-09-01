import type { QueueReportRow } from "../../../contracts/types";
import type { QueueReportTicketFact } from "./types";

// Agregação pura do relatório (docs/chamados-plugin.md §7). Sem I/O — coberta por teste unitário.
// O store devolve a lista de filas + os fatos por chamado; aqui vira uma linha por fila.

const ACTIVE_STATUSES = new Set(["open", "in_progress", "waiting"]);
const MINUTE_MS = 60_000;

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function buildQueueReport(
  queues: { id: string; name: string }[],
  facts: QueueReportTicketFact[],
  now: Date = new Date(),
): { rows: QueueReportRow[]; generatedAt: Date } {
  const factsByQueue = new Map<string, QueueReportTicketFact[]>();
  for (const fact of facts) {
    const list = factsByQueue.get(fact.queueId) ?? [];
    list.push(fact);
    factsByQueue.set(fact.queueId, list);
  }

  const rows = queues.map((queue): QueueReportRow => {
    const queueFacts = factsByQueue.get(queue.id) ?? [];

    const openCount = queueFacts.filter((f) => ACTIVE_STATUSES.has(f.status)).length;
    const resolved = queueFacts.filter((f) => f.resolvedAt !== null);

    const withSla = resolved.filter((f) => f.slaDueAt !== null);
    const metSla = withSla.filter((f) => f.resolvedAt!.getTime() <= f.slaDueAt!.getTime());
    const slaMetPct = withSla.length > 0 ? round1((metSla.length / withSla.length) * 100) : null;

    const avgResolutionMinutes =
      resolved.length > 0
        ? round1(
            resolved.reduce((sum, f) => sum + (f.resolvedAt!.getTime() - f.createdAt.getTime()), 0) /
              resolved.length /
              MINUTE_MS,
          )
        : null;

    const rated = queueFacts.filter((f) => f.ratingScore !== null);
    const avgRating =
      rated.length > 0 ? round1(rated.reduce((sum, f) => sum + f.ratingScore!, 0) / rated.length) : null;

    return {
      queueId: queue.id,
      queueName: queue.name,
      openCount,
      resolvedCount: resolved.length,
      slaMetPct,
      avgResolutionMinutes,
      avgRating,
      ratedCount: rated.length,
    };
  });

  return { rows, generatedAt: now };
}
