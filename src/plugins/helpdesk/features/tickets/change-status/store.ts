import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { ticketEvents, tickets } from "../../../database/schema";
import type { TicketRecord, TicketStatus } from "../../../contracts/types";

// Muda o status e grava o `status_change` correspondente (meta {from,to}) na mesma transação — a
// timeline é a fonte de verdade da auditoria (§2.2).
export async function applyStatusChange(input: {
  ticketId: string;
  from: TicketStatus;
  to: TicketStatus;
  note: string | null;
  actorId: string;
  resolvedAt?: Date | null;
  closedAt?: Date | null;
}): Promise<TicketRecord> {
  return db.transaction(async (tx) => {
    const set: Record<string, unknown> = { status: input.to, updatedAt: new Date() };
    if (input.resolvedAt !== undefined) set.resolvedAt = input.resolvedAt;
    if (input.closedAt !== undefined) set.closedAt = input.closedAt;

    const [ticket] = await tx.update(tickets).set(set).where(eq(tickets.id, input.ticketId)).returning();

    await tx.insert(ticketEvents).values({
      ticketId: input.ticketId,
      kind: "status_change",
      authorUserId: input.actorId,
      visibility: "public",
      body: input.note,
      meta: { from: input.from, to: input.to },
    });

    return ticket as TicketRecord;
  });
}
