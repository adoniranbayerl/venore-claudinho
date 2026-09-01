import { and, eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { queueMembers, ticketEvents, tickets } from "../../../database/schema";
import type { TicketRecord } from "../../../contracts/types";

export async function isQueueMember(queueId: string, userId: string): Promise<boolean> {
  const [row] = await db
    .select({ userId: queueMembers.userId })
    .from(queueMembers)
    .where(and(eq(queueMembers.queueId, queueId), eq(queueMembers.userId, userId)))
    .limit(1);
  return Boolean(row);
}

// Atribui (ou desatribui) e grava o evento `assignment` (visibilidade `internal` — o solicitante
// não precisa ver a movimentação interna de equipe) na mesma transação. Atribuir a alguém conta
// como "primeira resposta" da equipe (§2.4) — `first_response_at` recebe `now()` se ainda era
// nulo (COALESCE, atômico, sem leitura prévia). Desatribuir não mexe nele.
export async function applyAssignment(input: {
  ticketId: string;
  from: string | null;
  to: string | null;
  actorId: string;
}): Promise<TicketRecord> {
  return db.transaction(async (tx) => {
    const set: Record<string, unknown> = { assigneeUserId: input.to, updatedAt: new Date() };
    if (input.to !== null) {
      set.firstResponseAt = sql`coalesce(${tickets.firstResponseAt}, now())`;
    }

    const [ticket] = await tx.update(tickets).set(set).where(eq(tickets.id, input.ticketId)).returning();

    await tx.insert(ticketEvents).values({
      ticketId: input.ticketId,
      kind: "assignment",
      authorUserId: input.actorId,
      visibility: "internal",
      meta: { from: input.from, to: input.to },
    });

    return ticket as TicketRecord;
  });
}
