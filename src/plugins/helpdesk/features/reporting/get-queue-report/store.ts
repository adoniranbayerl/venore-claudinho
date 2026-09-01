import { asc, inArray, isNull } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { queues, tickets } from "../../../database/schema";
import type { QueueReportTicketFact } from "./types";

// Leitura do relatório (docs/chamados-plugin.md §7). Duas queries simples — filas ativas + os
// fatos por chamado; a agregação mora em view.ts (pura, testável). O volume de uma rede interna
// não justifica GROUP BY/agregação no SQL ainda.

// `allowedQueueIds` recorta pra só as filas visíveis ao ator (helpdesk.work). undefined = todas
// (helpdesk.manage / helpdesk.read).
export async function findReportQueues(allowedQueueIds?: string[]): Promise<{ id: string; name: string }[]> {
  if (allowedQueueIds && allowedQueueIds.length === 0) return [];
  const rows = await db
    .select({ id: queues.id, name: queues.name })
    .from(queues)
    .where(
      allowedQueueIds
        ? inArray(queues.id, allowedQueueIds)
        : isNull(queues.archivedAt),
    )
    .orderBy(asc(queues.position), asc(queues.name));
  return rows;
}

export async function findReportTicketFacts(allowedQueueIds?: string[]): Promise<QueueReportTicketFact[]> {
  if (allowedQueueIds && allowedQueueIds.length === 0) return [];
  const rows = await db
    .select({
      queueId: tickets.queueId,
      status: tickets.status,
      createdAt: tickets.createdAt,
      resolvedAt: tickets.resolvedAt,
      slaDueAt: tickets.slaDueAt,
      ratingScore: tickets.ratingScore,
    })
    .from(tickets)
    .where(allowedQueueIds ? inArray(tickets.queueId, allowedQueueIds) : undefined);
  return rows.map((row) => ({
    queueId: row.queueId,
    status: row.status,
    createdAt: row.createdAt,
    resolvedAt: row.resolvedAt ?? null,
    slaDueAt: row.slaDueAt ?? null,
    ratingScore: row.ratingScore ?? null,
  }));
}
