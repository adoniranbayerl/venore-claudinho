import { and, asc, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { categories, queues, ticketAttachments, ticketEvents, tickets } from "../../../database/schema";
import type { TicketEventRecord, TicketAttachmentRecord, TicketRecord } from "../../../contracts/types";

export async function findTicketById(ticketId: string): Promise<TicketRecord | null> {
  const [row] = await db.select().from(tickets).where(eq(tickets.id, ticketId)).limit(1);
  return (row as TicketRecord) ?? null;
}

export async function findTicketByQueueKeyAndSeq(queueKey: string, seq: number): Promise<TicketRecord | null> {
  const [row] = await db
    .select({ ticket: tickets })
    .from(tickets)
    .innerJoin(queues, eq(queues.id, tickets.queueId))
    .where(and(eq(queues.key, queueKey), eq(tickets.seq, seq)))
    .limit(1);
  return (row?.ticket as TicketRecord) ?? null;
}

export async function findQueueBasics(queueId: string): Promise<{ id: string; key: string; name: string } | null> {
  const [row] = await db.select({ id: queues.id, key: queues.key, name: queues.name }).from(queues).where(eq(queues.id, queueId)).limit(1);
  return row ?? null;
}

export async function findCategoryBasics(categoryId: string): Promise<{ id: string; label: string } | null> {
  const [row] = await db.select({ id: categories.id, label: categories.label }).from(categories).where(eq(categories.id, categoryId)).limit(1);
  return row ?? null;
}

export async function findEventsByTicket(ticketId: string): Promise<TicketEventRecord[]> {
  const rows = await db
    .select()
    .from(ticketEvents)
    .where(eq(ticketEvents.ticketId, ticketId))
    .orderBy(asc(ticketEvents.createdAt), asc(ticketEvents.id));
  return rows as TicketEventRecord[];
}

export async function findAttachmentsByTicket(ticketId: string): Promise<TicketAttachmentRecord[]> {
  const rows = await db
    .select()
    .from(ticketAttachments)
    .where(eq(ticketAttachments.ticketId, ticketId))
    .orderBy(asc(ticketAttachments.createdAt), asc(ticketAttachments.id));
  return rows as TicketAttachmentRecord[];
}
