import { asc, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { ticketAttachments } from "../../../database/schema";
import type { TicketAttachmentRecord } from "../../../contracts/types";

export async function findAttachmentRecords(ticketId: string): Promise<TicketAttachmentRecord[]> {
  const rows = await db
    .select()
    .from(ticketAttachments)
    .where(eq(ticketAttachments.ticketId, ticketId))
    .orderBy(asc(ticketAttachments.createdAt), asc(ticketAttachments.id));
  return rows as TicketAttachmentRecord[];
}
