import { eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { categories, queues, ticketAttachments, ticketCounters, ticketEvents, tickets } from "../../../database/schema";
import type { TicketPriority, TicketRecord } from "../../../contracts/types";

export type QueueForOpen = {
  id: string;
  key: string;
  name: string;
  archivedAt: Date | null;
  defaultPriority: TicketPriority;
};
export type CategoryForOpen = {
  id: string;
  queueId: string;
  archivedAt: Date | null;
  defaultPriority: TicketPriority | null;
};

export async function findQueueForOpen(queueId: string): Promise<QueueForOpen | null> {
  const [row] = await db
    .select({
      id: queues.id,
      key: queues.key,
      name: queues.name,
      archivedAt: queues.archivedAt,
      defaultPriority: queues.defaultPriority,
    })
    .from(queues)
    .where(eq(queues.id, queueId))
    .limit(1);
  return row ? { ...row, defaultPriority: row.defaultPriority as TicketPriority } : null;
}

export async function findCategoryForOpen(categoryId: string): Promise<CategoryForOpen | null> {
  const [row] = await db
    .select({
      id: categories.id,
      queueId: categories.queueId,
      archivedAt: categories.archivedAt,
      defaultPriority: categories.defaultPriority,
    })
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);
  return row ? { ...row, defaultPriority: (row.defaultPriority as TicketPriority | null) ?? null } : null;
}

// Cria o chamado, seu número por fila e o evento `created` numa única transação. O contador
// (`ticket_counters.next_seq`, próximo número a distribuir) é criado/incrementado com
// UPDATE ... RETURNING — serializa a criação de chamado por fila (§2.2/§8). O `seq` distribuído é
// sempre `next_seq` retornado menos 1.
export async function createTicketWithSequence(input: {
  queueId: string;
  categoryId: string | null;
  title: string;
  description: string;
  location: string | null;
  requesterUserId: string;
  attachmentMediaIds: string[];
  priority: TicketPriority;
  slaDueAt: Date | null;
}): Promise<TicketRecord> {
  return db.transaction(async (tx) => {
    const [counter] = await tx
      .insert(ticketCounters)
      .values({ queueId: input.queueId, nextSeq: 2 })
      .onConflictDoUpdate({
        target: ticketCounters.queueId,
        set: { nextSeq: sql`${ticketCounters.nextSeq} + 1` },
      })
      .returning({ nextSeq: ticketCounters.nextSeq });
    const seq = counter.nextSeq - 1;

    const [ticket] = await tx
      .insert(tickets)
      .values({
        queueId: input.queueId,
        categoryId: input.categoryId,
        seq,
        title: input.title,
        description: input.description,
        status: "open",
        priority: input.priority,
        slaDueAt: input.slaDueAt,
        requesterUserId: input.requesterUserId,
        location: input.location,
      })
      .returning();

    const [event] = await tx
      .insert(ticketEvents)
      .values({
        ticketId: ticket.id,
        kind: "created",
        authorUserId: input.requesterUserId,
        visibility: "public",
      })
      .returning({ id: ticketEvents.id });

    if (input.attachmentMediaIds.length > 0) {
      await tx.insert(ticketAttachments).values(
        input.attachmentMediaIds.map((mediaId) => ({
          ticketId: ticket.id,
          eventId: event.id,
          mediaId,
          uploadedByUserId: input.requesterUserId,
        })),
      );
    }

    return ticket as TicketRecord;
  });
}
