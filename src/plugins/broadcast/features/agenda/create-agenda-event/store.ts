import { db } from "@/infrastructure/database/client";
import { broadcastAgendaEvents } from "../../../database/schema";
import type { BroadcastAgendaEventRecord } from "../../../contracts/types";

export async function insertAgendaEvent(input: {
  agendaId: string;
  title: string;
  description: string | null;
  startAt: Date;
  coverMediaAssetId: string | null;
}): Promise<BroadcastAgendaEventRecord> {
  const [row] = await db.insert(broadcastAgendaEvents).values(input).returning();
  return row as BroadcastAgendaEventRecord;
}
