import { eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { broadcastAgendaEvents } from "../../../database/schema";
import type { BroadcastAgendaEventRecord } from "../../../contracts/types";

export async function findAgendaEventById(id: string): Promise<BroadcastAgendaEventRecord | null> {
  const [row] = await db.select().from(broadcastAgendaEvents).where(eq(broadcastAgendaEvents.id, id)).limit(1);
  return (row as BroadcastAgendaEventRecord) ?? null;
}

export async function applyAgendaEventUpdate(input: {
  id: string;
  title: string;
  description: string | null;
  startAt: Date;
  recurring: boolean;
  endAt: Date | null;
  coverMediaAssetId: string | null;
  location: string | null;
}): Promise<BroadcastAgendaEventRecord> {
  const [row] = await db
    .update(broadcastAgendaEvents)
    .set({
      title: input.title,
      description: input.description,
      startAt: input.startAt,
      recurring: input.recurring,
      endAt: input.endAt,
      coverMediaAssetId: input.coverMediaAssetId,
      location: input.location,
      updatedAt: sql`now()`,
    })
    .where(eq(broadcastAgendaEvents.id, input.id))
    .returning();
  return row as BroadcastAgendaEventRecord;
}
