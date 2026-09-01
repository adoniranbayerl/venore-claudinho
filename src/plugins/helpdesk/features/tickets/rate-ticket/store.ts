import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { ticketEvents, tickets } from "../../../database/schema";
import type { TicketStatus } from "../../../contracts/types";

export type TicketForRating = {
  id: string;
  queueId: string;
  status: TicketStatus;
  requesterUserId: string | null;
  requesterName: string | null;
};

const RATING_COLUMNS = {
  id: tickets.id,
  queueId: tickets.queueId,
  status: tickets.status,
  requesterUserId: tickets.requesterUserId,
  requesterName: tickets.requesterName,
} as const;

function normalize(row: Record<string, unknown>): TicketForRating {
  return { ...(row as TicketForRating), status: row.status as TicketStatus };
}

export async function findTicketForRating(ticketId: string): Promise<TicketForRating | null> {
  const [row] = await db.select(RATING_COLUMNS).from(tickets).where(eq(tickets.id, ticketId)).limit(1);
  return row ? normalize(row) : null;
}

export async function findTicketForRatingByToken(trackingToken: string): Promise<TicketForRating | null> {
  const [row] = await db.select(RATING_COLUMNS).from(tickets).where(eq(tickets.trackingToken, trackingToken)).limit(1);
  return row ? normalize(row) : null;
}

// Fase 7 — grava o evento `rating` na timeline E denormaliza a nota em `tickets.rating_score`, na
// mesma transação (§2.2). Reavaliar substitui: um novo evento `rating` é adicionado e
// `rating_score` passa a valer a nota nova (a leitura pública já pega o último evento; o relatório
// lê a coluna). `authorUserId` preenchido = avaliação pelo portal logado; null + `authorLabel` =
// avaliação pelo link anônimo.
export async function applyRating(input: {
  ticketId: string;
  score: number;
  comment: string | null;
  authorUserId: string | null;
  authorLabel: string | null;
}): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.insert(ticketEvents).values({
      ticketId: input.ticketId,
      kind: "rating",
      authorUserId: input.authorUserId,
      authorLabel: input.authorLabel,
      visibility: "public",
      body: input.comment,
      meta: { score: input.score },
    });
    await tx
      .update(tickets)
      .set({ ratingScore: input.score, updatedAt: new Date() })
      .where(eq(tickets.id, input.ticketId));
  });
}
