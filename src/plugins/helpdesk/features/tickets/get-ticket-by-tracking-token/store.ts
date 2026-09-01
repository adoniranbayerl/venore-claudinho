import { and, asc, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { categories, queues, ticketEvents, tickets } from "../../../database/schema";
import type { TicketEventRecord, TicketStatus } from "../../../contracts/types";

export type TrackedTicketRow = {
  id: string;
  queueKey: string;
  queueName: string;
  seq: number;
  title: string;
  description: string;
  status: TicketStatus;
  location: string | null;
  requesterName: string | null;
  categoryLabel: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
};

export async function findTrackedTicketByToken(trackingToken: string): Promise<TrackedTicketRow | null> {
  const [row] = await db
    .select({
      id: tickets.id,
      queueKey: queues.key,
      queueName: queues.name,
      seq: tickets.seq,
      title: tickets.title,
      description: tickets.description,
      status: tickets.status,
      location: tickets.location,
      requesterName: tickets.requesterName,
      categoryLabel: categories.label,
      createdAt: tickets.createdAt,
      resolvedAt: tickets.resolvedAt,
    })
    .from(tickets)
    .innerJoin(queues, eq(queues.id, tickets.queueId))
    .leftJoin(categories, eq(categories.id, tickets.categoryId))
    .where(eq(tickets.trackingToken, trackingToken))
    .limit(1);
  if (!row) return null;
  return { ...row, status: row.status as TicketStatus, categoryLabel: row.categoryLabel ?? null };
}

// Só eventos `public` — a página de acompanhamento anônima nunca vê nota `internal`.
export async function findPublicEventsByTicket(ticketId: string): Promise<TicketEventRecord[]> {
  const rows = await db
    .select()
    .from(ticketEvents)
    .where(and(eq(ticketEvents.ticketId, ticketId), eq(ticketEvents.visibility, "public")))
    .orderBy(asc(ticketEvents.createdAt), asc(ticketEvents.id));
  return rows as TicketEventRecord[];
}
