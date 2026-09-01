import { and, isNotNull, isNull, notInArray } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { tickets } from "../../../database/schema";

// Candidatos ao alerta de SLA: chamado com prazo definido, ainda não resolvido e num estado não
// terminal. O filtro de "cruzou 80 %" é feito em memória por shared/sla.ts (needsSlaAtRiskAlert)
// — o volume de uma rede interna não justifica expressar a fração no SQL.
export type SlaCandidate = {
  id: string;
  queueId: string;
  slaDueAt: Date;
  resolvedAt: Date | null;
  createdAt: Date;
};

export async function findSlaCandidateTickets(): Promise<SlaCandidate[]> {
  const rows = await db
    .select({
      id: tickets.id,
      queueId: tickets.queueId,
      slaDueAt: tickets.slaDueAt,
      resolvedAt: tickets.resolvedAt,
      createdAt: tickets.createdAt,
    })
    .from(tickets)
    .where(
      and(
        isNotNull(tickets.slaDueAt),
        isNull(tickets.resolvedAt),
        notInArray(tickets.status, ["resolved", "closed", "cancelled"]),
      ),
    );
  return rows.flatMap((row) => (row.slaDueAt ? [{ ...row, slaDueAt: row.slaDueAt }] : []));
}
