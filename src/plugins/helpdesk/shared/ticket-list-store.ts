import { and, desc, eq, inArray, type SQL } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { categories, queues, tickets } from "../database/schema";
import { formatTicketReference } from "./ticket-reference";
import { slaState } from "./sla";
import type { TicketListItem, TicketStatus } from "../contracts/types";

// Leitura compartilhada por list-tickets (equipe) e list-my-tickets (solicitante) — as duas
// montam o mesmo TicketListItem (join fila + categoria, número formatado). Fora de um store.ts
// por feature de propósito, mesmo racional de shared/scoped-authorization/store.ts: nenhuma das
// duas features é dona natural da query.
export type TicketListFilter = {
  queueIds?: string[];
  requesterUserId?: string;
  assigneeUserId?: string;
  statuses?: TicketStatus[];
};

export async function findTicketListItems(filter: TicketListFilter): Promise<TicketListItem[]> {
  const conditions: SQL[] = [];
  if (filter.queueIds) {
    if (filter.queueIds.length === 0) return [];
    conditions.push(inArray(tickets.queueId, filter.queueIds));
  }
  if (filter.requesterUserId) conditions.push(eq(tickets.requesterUserId, filter.requesterUserId));
  if (filter.assigneeUserId) conditions.push(eq(tickets.assigneeUserId, filter.assigneeUserId));
  if (filter.statuses && filter.statuses.length > 0) conditions.push(inArray(tickets.status, filter.statuses));

  const rows = await db
    .select({
      id: tickets.id,
      queueId: tickets.queueId,
      queueKey: queues.key,
      queueName: queues.name,
      seq: tickets.seq,
      title: tickets.title,
      status: tickets.status,
      priority: tickets.priority,
      categoryLabel: categories.label,
      location: tickets.location,
      assigneeUserId: tickets.assigneeUserId,
      requesterUserId: tickets.requesterUserId,
      slaDueAt: tickets.slaDueAt,
      resolvedAt: tickets.resolvedAt,
      createdAt: tickets.createdAt,
      updatedAt: tickets.updatedAt,
    })
    .from(tickets)
    .innerJoin(queues, eq(queues.id, tickets.queueId))
    .leftJoin(categories, eq(categories.id, tickets.categoryId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(tickets.updatedAt), desc(tickets.createdAt));

  const now = new Date();
  return rows.map((row) => ({
    id: row.id,
    reference: formatTicketReference({ queueKey: row.queueKey, seq: row.seq }),
    queueId: row.queueId,
    queueName: row.queueName,
    seq: row.seq,
    title: row.title,
    status: row.status as TicketStatus,
    priority: row.priority as TicketListItem["priority"],
    categoryLabel: row.categoryLabel ?? null,
    location: row.location ?? null,
    assigneeUserId: row.assigneeUserId ?? null,
    requesterUserId: row.requesterUserId ?? null,
    slaDueAt: row.slaDueAt ?? null,
    slaState: slaState({ slaDueAt: row.slaDueAt ?? null, resolvedAt: row.resolvedAt ?? null, createdAt: row.createdAt }, now),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}
