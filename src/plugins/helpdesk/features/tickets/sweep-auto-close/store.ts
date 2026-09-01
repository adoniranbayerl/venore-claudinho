import { and, eq, lte } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { ticketEvents, tickets } from "../../../database/schema";

// Candidatos ao auto-close (§5) — chamados `resolved` cujo `resolved_at` é anterior ao corte de
// N dias. A janela de reabertura já expirou; se o solicitante fosse reabrir, teria reaberto.
export type AutoCloseCandidate = { id: string; queueId: string };

export async function findResolvedTicketsPastAutoClose(cutoff: Date): Promise<AutoCloseCandidate[]> {
  const rows = await db
    .select({ id: tickets.id, queueId: tickets.queueId })
    .from(tickets)
    .where(and(eq(tickets.status, "resolved"), lte(tickets.resolvedAt, cutoff)));
  return rows;
}

// Fecha um chamado que ainda está `resolved` (o `where` re-checa o estado — se alguém reabriu ou
// fechou no meio-tempo, nada acontece) e grava o `status_change` de sistema. Devolve true quando
// de fato fechou.
export async function applyAutoClose(ticketId: string, days: number): Promise<boolean> {
  return db.transaction(async (tx) => {
    const now = new Date();
    const updated = await tx
      .update(tickets)
      .set({ status: "closed", closedAt: now, updatedAt: now })
      .where(and(eq(tickets.id, ticketId), eq(tickets.status, "resolved")))
      .returning({ id: tickets.id });

    if (updated.length === 0) return false;

    await tx.insert(ticketEvents).values({
      ticketId,
      kind: "status_change",
      authorUserId: null,
      authorLabel: "Sistema",
      visibility: "public",
      body: `Fechado automaticamente após ${days} dias sem reabertura.`,
      meta: { from: "resolved", to: "closed" },
    });
    return true;
  });
}
