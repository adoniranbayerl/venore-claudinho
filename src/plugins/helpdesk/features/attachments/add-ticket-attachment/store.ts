import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { ticketAttachments, ticketEvents } from "../../../database/schema";
import type { TicketAttachmentRecord } from "../../../contracts/types";

// Conta anexos já presos ao mesmo escopo (chamado, quando eventId=null; ou um comentário) — o
// service usa pra reforçar o teto de 3 (§2.2).
export async function countAttachmentsInScope(ticketId: string, eventId: string | null): Promise<number> {
  const rows = await db
    .select({ id: ticketAttachments.id })
    .from(ticketAttachments)
    .where(
      and(
        eq(ticketAttachments.ticketId, ticketId),
        eventId === null ? isNull(ticketAttachments.eventId) : eq(ticketAttachments.eventId, eventId),
      ),
    );
  return rows.length;
}

export async function eventBelongsToTicket(eventId: string, ticketId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: ticketEvents.id })
    .from(ticketEvents)
    .where(and(eq(ticketEvents.id, eventId), eq(ticketEvents.ticketId, ticketId)))
    .limit(1);
  return Boolean(row);
}

export async function insertAttachments(input: {
  ticketId: string;
  eventId: string | null;
  mediaIds: string[];
  uploadedByUserId: string;
}): Promise<TicketAttachmentRecord[]> {
  const rows = await db
    .insert(ticketAttachments)
    .values(
      input.mediaIds.map((mediaId) => ({
        ticketId: input.ticketId,
        eventId: input.eventId,
        mediaId,
        uploadedByUserId: input.uploadedByUserId,
      })),
    )
    .returning();
  return rows as TicketAttachmentRecord[];
}
