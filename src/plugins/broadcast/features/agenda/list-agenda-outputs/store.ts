import { db } from "@/infrastructure/database/client";
import { broadcastOutputAgendas } from "../../../database/schema";

export async function findAllOutputAgendaLinks(): Promise<{ outputId: string; agendaId: string }[]> {
  return db.select({ outputId: broadcastOutputAgendas.outputId, agendaId: broadcastOutputAgendas.agendaId }).from(broadcastOutputAgendas);
}
