import { and, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { broadcastAgendaEditors, broadcastAgendaEvents, broadcastOutputEditors } from "../../database/schema";

// Acesso a banco fora de um store.ts por feature — exceção deliberada (mesmo espírito das exceções
// já documentadas no AGENTS.md seção 1: DrizzleAdapter, useTheme()): esta checagem de "está
// atribuído a este recurso" é usada por ~7 handlers espalhados entre features/agenda e
// features/outputs, e nenhum deles é dono natural dela — duplicar a query em cada um seria pior
// que centralizar aqui, ao lado de shared/scoped-authorization/index.ts (a camada de autorização
// que consome isto).
export async function isUserAssignedToAgenda(agendaId: string, userId: string): Promise<boolean> {
  const [row] = await db
    .select({ agendaId: broadcastAgendaEditors.agendaId })
    .from(broadcastAgendaEditors)
    .where(and(eq(broadcastAgendaEditors.agendaId, agendaId), eq(broadcastAgendaEditors.userId, userId)))
    .limit(1);
  return Boolean(row);
}

export async function isUserAssignedToOutput(outputId: string, userId: string): Promise<boolean> {
  const [row] = await db
    .select({ outputId: broadcastOutputEditors.outputId })
    .from(broadcastOutputEditors)
    .where(and(eq(broadcastOutputEditors.outputId, outputId), eq(broadcastOutputEditors.userId, userId)))
    .limit(1);
  return Boolean(row);
}

// update-agenda-event/delete-agenda-event só recebem eventId, não agendaId — precisa resolver o
// pai antes de checar atribuição.
export async function findAgendaIdByEventId(eventId: string): Promise<string | null> {
  const [row] = await db
    .select({ agendaId: broadcastAgendaEvents.agendaId })
    .from(broadcastAgendaEvents)
    .where(eq(broadcastAgendaEvents.id, eventId))
    .limit(1);
  return row?.agendaId ?? null;
}

// Usado pelos handlers de listagem (list-agendas/list-outputs) pra filtrar o resultado quando o
// ator só tem a permission estreita (broadcast.agenda.manage/broadcast.outputs.manage), não a
// ampla (broadcast.manage) — ver shared/scoped-authorization/index.ts.
export async function findAgendaIdsAssignedToUser(userId: string): Promise<string[]> {
  const rows = await db.select({ agendaId: broadcastAgendaEditors.agendaId }).from(broadcastAgendaEditors).where(eq(broadcastAgendaEditors.userId, userId));
  return rows.map((row) => row.agendaId);
}

export async function findOutputIdsAssignedToUser(userId: string): Promise<string[]> {
  const rows = await db.select({ outputId: broadcastOutputEditors.outputId }).from(broadcastOutputEditors).where(eq(broadcastOutputEditors.userId, userId));
  return rows.map((row) => row.outputId);
}
