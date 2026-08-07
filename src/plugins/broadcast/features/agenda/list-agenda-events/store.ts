import { asc } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { broadcastAgendaEvents } from "../../../database/schema";
import type { BroadcastAgendaEventRecord } from "../../../contracts/types";

export async function findAllAgendaEvents(): Promise<BroadcastAgendaEventRecord[]> {
  const rows = await db.select().from(broadcastAgendaEvents).orderBy(asc(broadcastAgendaEvents.startAt));
  return rows as BroadcastAgendaEventRecord[];
}
