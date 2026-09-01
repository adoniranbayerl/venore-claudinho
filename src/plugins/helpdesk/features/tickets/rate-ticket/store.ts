import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { ticketEvents, tickets } from "../../../database/schema";
import type { TicketStatus } from "../../../contracts/types";

export type TicketForRating = {
  id: string;
  queueId: string;
  status: TicketStatus;
  requesterName: string | null;
};

export async function findTicketForRatingByToken(trackingToken: string): Promise<TicketForRating | null> {
  const [row] = await db
    .select({
      id: tickets.id,
      queueId: tickets.queueId,
      status: tickets.status,
      requesterName: tickets.requesterName,
    })
    .from(tickets)
    .where(eq(tickets.trackingToken, trackingToken))
    .limit(1);
  if (!row) return null;
  return { ...row, status: row.status as TicketStatus };
}

// Grava o evento `rating` (§2.5). A Fase 7 denormaliza o score em `tickets.rating_score` e monta o
// relatório; aqui é só a linha na timeline. `meta.score` guarda a nota; `body` a observação
// opcional.
export async function insertRatingEvent(input: {
  ticketId: string;
  score: number;
  comment: string | null;
  authorLabel: string;
}): Promise<void> {
  await db.insert(ticketEvents).values({
    ticketId: input.ticketId,
    kind: "rating",
    authorUserId: null,
    authorLabel: input.authorLabel,
    visibility: "public",
    body: input.comment,
    meta: { score: input.score },
  });
}
