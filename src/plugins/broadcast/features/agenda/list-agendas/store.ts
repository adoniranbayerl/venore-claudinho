import { asc } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { broadcastAgendas } from "../../../database/schema";
import type { BroadcastAgendaRecord } from "../../../contracts/types";

export async function findAllAgendas(): Promise<BroadcastAgendaRecord[]> {
  const rows = await db.select().from(broadcastAgendas).orderBy(asc(broadcastAgendas.order));
  return rows as BroadcastAgendaRecord[];
}
