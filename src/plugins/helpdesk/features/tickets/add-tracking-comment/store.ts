import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { ticketEvents, tickets } from "../../../database/schema";
import type { TicketEventRecord, TicketStatus } from "../../../contracts/types";

export type TrackedTicketForComment = {
  id: string;
  queueId: string;
  status: TicketStatus;
  requesterName: string | null;
  assigneeUserId: string | null;
};

export async function findTicketForTrackingComment(trackingToken: string): Promise<TrackedTicketForComment | null> {
  const [row] = await db
    .select({
      id: tickets.id,
      queueId: tickets.queueId,
      status: tickets.status,
      requesterName: tickets.requesterName,
      assigneeUserId: tickets.assigneeUserId,
    })
    .from(tickets)
    .where(eq(tickets.trackingToken, trackingToken))
    .limit(1);
  if (!row) return null;
  return { ...row, status: row.status as TicketStatus };
}

// Grava o comentário público do solicitante anônimo e, se o chamado estava `waiting`, volta para
// `in_progress` na mesma transação (§5, "faltou informação" → ao responder, volta). O
// `status_change` que acompanha essa volta também é gravado aqui. `authorUserId` é null (não há
// usuário); `authorLabel` é o nome que a pessoa deu no quiosque.
export async function insertTrackingComment(input: {
  ticketId: string;
  body: string;
  authorLabel: string;
  returnWaitingToInProgress: boolean;
}): Promise<{ event: TicketEventRecord; statusChangedTo: TicketStatus | null }> {
  return db.transaction(async (tx) => {
    const [event] = await tx
      .insert(ticketEvents)
      .values({
        ticketId: input.ticketId,
        kind: "comment",
        authorUserId: null,
        authorLabel: input.authorLabel,
        visibility: "public",
        body: input.body,
      })
      .returning();

    let statusChangedTo: TicketStatus | null = null;
    if (input.returnWaitingToInProgress) {
      await tx.update(tickets).set({ status: "in_progress", updatedAt: new Date() }).where(eq(tickets.id, input.ticketId));
      await tx.insert(ticketEvents).values({
        ticketId: input.ticketId,
        kind: "status_change",
        authorUserId: null,
        authorLabel: "Sistema",
        visibility: "public",
        meta: { from: "waiting", to: "in_progress" },
      });
      statusChangedTo = "in_progress";
    } else {
      await tx.update(tickets).set({ updatedAt: new Date() }).where(eq(tickets.id, input.ticketId));
    }

    return { event: event as TicketEventRecord, statusChangedTo };
  });
}
