import { eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { ticketEvents, tickets } from "../../../database/schema";
import type { TicketEventRecord, TicketEventVisibility } from "../../../contracts/types";

// Grava o comentário e, quando o solicitante responde um chamado que estava `waiting`, volta pra
// `in_progress` na mesma transação (§5, "faltou informação" → ao responder, volta pra
// in_progress). O `status_change` que acompanha essa volta também é gravado aqui.
export async function insertComment(input: {
  ticketId: string;
  body: string;
  visibility: TicketEventVisibility;
  authorUserId: string;
  returnWaitingToInProgress: boolean;
  // §2.4 — quando true, `first_response_at` recebe now() se ainda era nulo (COALESCE, atômico).
  markFirstResponse: boolean;
}): Promise<{ event: TicketEventRecord; statusChangedTo: string | null }> {
  return db.transaction(async (tx) => {
    const [event] = await tx
      .insert(ticketEvents)
      .values({
        ticketId: input.ticketId,
        kind: "comment",
        authorUserId: input.authorUserId,
        visibility: input.visibility,
        body: input.body,
      })
      .returning();

    const firstResponsePatch = input.markFirstResponse
      ? { firstResponseAt: sql`coalesce(${tickets.firstResponseAt}, now())` }
      : {};

    let statusChangedTo: string | null = null;
    if (input.returnWaitingToInProgress) {
      await tx
        .update(tickets)
        .set({ status: "in_progress", updatedAt: new Date(), ...firstResponsePatch })
        .where(eq(tickets.id, input.ticketId));
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
      await tx
        .update(tickets)
        .set({ updatedAt: new Date(), ...firstResponsePatch })
        .where(eq(tickets.id, input.ticketId));
    }

    return { event: event as TicketEventRecord, statusChangedTo };
  });
}
