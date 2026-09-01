import { eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { queues, ticketCounters, ticketEvents, tickets } from "../../../database/schema";
import type { TicketPriority, TicketRecord } from "../../../contracts/types";

export type QueueForKioskSubmit = { id: string; key: string; name: string; defaultPriority: TicketPriority };

// Fila do chamado do quiosque — ativa (não arquivada) obrigatoriamente. `null` também para fila
// inexistente: o service trata os dois como "fila indisponível".
export async function findActiveQueueForKioskSubmit(queueId: string): Promise<QueueForKioskSubmit | null> {
  const [row] = await db
    .select({
      id: queues.id,
      key: queues.key,
      name: queues.name,
      defaultPriority: queues.defaultPriority,
      archivedAt: queues.archivedAt,
    })
    .from(queues)
    .where(eq(queues.id, queueId))
    .limit(1);
  if (!row || row.archivedAt !== null) return null;
  return { id: row.id, key: row.key, name: row.name, defaultPriority: row.defaultPriority as TicketPriority };
}

// Cria o chamado anônimo, seu número por fila e o evento `created` numa única transação — mesmo
// mecanismo de open-ticket/store.ts (UPDATE ... RETURNING no contador serializa a criação por
// fila), mas sem `requester_user_id` e com os campos de solicitante anônimo + `tracking_token`.
export async function createKioskTicketWithSequence(input: {
  queueId: string;
  title: string;
  description: string;
  location: string | null;
  requesterName: string | null;
  requesterContact: string | null;
  originKioskId: string;
  trackingToken: string;
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
        seq,
        title: input.title,
        description: input.description,
        status: "open",
        priority: input.priority,
        slaDueAt: input.slaDueAt,
        requesterUserId: null,
        requesterName: input.requesterName,
        requesterContact: input.requesterContact,
        originKioskId: input.originKioskId,
        trackingToken: input.trackingToken,
        location: input.location,
      })
      .returning();

    await tx.insert(ticketEvents).values({
      ticketId: ticket.id,
      kind: "created",
      authorUserId: null,
      // Rótulo humano na timeline pública (não há usuário para resolver o nome).
      authorLabel: input.requesterName ?? "Solicitante do quiosque",
      visibility: "public",
    });

    return ticket as TicketRecord;
  });
}
