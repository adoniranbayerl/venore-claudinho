import { eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { ticketEvents, tickets } from "../../../database/schema";
import type { TicketRecord, TicketStatus } from "../../../contracts/types";

export type TicketForReopen = {
  id: string;
  queueId: string;
  status: TicketStatus;
  requesterUserId: string | null;
  requesterName: string | null;
  resolvedAt: Date | null;
  reopenedCount: number;
};

const REOPEN_COLUMNS = {
  id: tickets.id,
  queueId: tickets.queueId,
  status: tickets.status,
  requesterUserId: tickets.requesterUserId,
  requesterName: tickets.requesterName,
  resolvedAt: tickets.resolvedAt,
  reopenedCount: tickets.reopenedCount,
} as const;

function normalize(row: Record<string, unknown>): TicketForReopen {
  return { ...(row as TicketForReopen), status: row.status as TicketStatus };
}

export async function findTicketForReopen(ticketId: string): Promise<TicketForReopen | null> {
  const [row] = await db.select(REOPEN_COLUMNS).from(tickets).where(eq(tickets.id, ticketId)).limit(1);
  return row ? normalize(row) : null;
}

export async function findTicketForReopenByToken(trackingToken: string): Promise<TicketForReopen | null> {
  const [row] = await db.select(REOPEN_COLUMNS).from(tickets).where(eq(tickets.trackingToken, trackingToken)).limit(1);
  return row ? normalize(row) : null;
}

// Reabre: volta o chamado para `in_progress`, limpa os carimbos finais, incrementa
// `reopened_count` e grava o evento `reopened` (visível ao solicitante) — tudo na mesma transação,
// a timeline é a fonte de verdade da auditoria (§2.2). `authorUserId` preenchido = reabertura pelo
// solicitante logado; null + `authorLabel` = reabertura pelo link anônimo.
export async function applyReopen(input: {
  ticketId: string;
  from: TicketStatus;
  authorUserId: string | null;
  authorLabel: string | null;
  note: string | null;
}): Promise<TicketRecord> {
  return db.transaction(async (tx) => {
    const [ticket] = await tx
      .update(tickets)
      .set({
        status: "in_progress",
        resolvedAt: null,
        closedAt: null,
        reopenedCount: sql`${tickets.reopenedCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, input.ticketId))
      .returning();

    await tx.insert(ticketEvents).values({
      ticketId: input.ticketId,
      kind: "reopened",
      authorUserId: input.authorUserId,
      authorLabel: input.authorLabel,
      visibility: "public",
      body: input.note,
      meta: { from: input.from, to: "in_progress" },
    });

    return ticket as TicketRecord;
  });
}
