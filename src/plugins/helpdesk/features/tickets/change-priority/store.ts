import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { ticketEvents, tickets } from "../../../database/schema";
import type { TicketPriority, TicketRecord } from "../../../contracts/types";

// Muda a prioridade, recarimba `sla_due_at` e grava o `priority_change` (meta {from,to},
// visibilidade `internal` — o solicitante não precisa ver a repriorização interna) na mesma
// transação. `slaDueAt` já vem calculado pelo service (now + resolution_minutes da política).
export async function applyPriorityChange(input: {
  ticketId: string;
  from: TicketPriority;
  to: TicketPriority;
  slaDueAt: Date | null;
  actorId: string;
}): Promise<TicketRecord> {
  return db.transaction(async (tx) => {
    const [ticket] = await tx
      .update(tickets)
      .set({ priority: input.to, slaDueAt: input.slaDueAt, updatedAt: new Date() })
      .where(eq(tickets.id, input.ticketId))
      .returning();

    await tx.insert(ticketEvents).values({
      ticketId: input.ticketId,
      kind: "priority_change",
      authorUserId: input.actorId,
      visibility: "internal",
      meta: { from: input.from, to: input.to },
    });

    return ticket as TicketRecord;
  });
}
