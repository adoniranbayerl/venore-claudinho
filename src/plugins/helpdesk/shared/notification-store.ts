import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { helpdeskNotifications, queueMembers, queues, tickets } from "../database/schema";
import { formatTicketReference } from "./ticket-reference";
import {
  HELPDESK_NOTIFICATIONS_PAGE_SIZE,
  type HelpdeskNotificationKind,
  type HelpdeskNotificationView,
} from "../contracts/types";

// Acesso a `helpdesk_notifications` compartilhado por shared/notify.ts (escreve) e pelas features
// notifications/* (lê/marca lido) — fora de um store.ts por feature de propósito, mesmo racional
// de shared/ticket-list-store.ts e shared/scoped-authorization/store.ts: nenhuma feature é dona
// natural da tabela e a escrita nasce dentro de outros services (open-ticket, assign-ticket…).

export async function findQueueMemberUserIds(queueId: string): Promise<string[]> {
  const rows = await db
    .select({ userId: queueMembers.userId })
    .from(queueMembers)
    .where(eq(queueMembers.queueId, queueId));
  return rows.map((row) => row.userId);
}

// Base pro `summary` pronto de uma notificação ("Manutenção · manutencao-87 · ..."), quando o
// service que chama notify() não tem a fila/seq em mãos.
export async function findTicketNotificationBasis(
  ticketId: string,
): Promise<{ queueName: string; reference: string } | null> {
  const [row] = await db
    .select({ queueName: queues.name, queueKey: queues.key, seq: tickets.seq })
    .from(tickets)
    .innerJoin(queues, eq(queues.id, tickets.queueId))
    .where(eq(tickets.id, ticketId))
    .limit(1);
  if (!row) return null;
  return { queueName: row.queueName, reference: formatTicketReference({ queueKey: row.queueKey, seq: row.seq }) };
}

export async function insertNotifications(
  rows: { recipientUserId: string; ticketId: string; kind: HelpdeskNotificationKind; summary: string }[],
): Promise<void> {
  if (rows.length === 0) return;
  await db.insert(helpdeskNotifications).values(rows);
}

// Fase 4 — dedup do alerta de SLA: uma vez que a fila foi avisada que um chamado está em risco,
// não re-avisa (não há "episódio de risco" no v1 — cruzou 80 % uma vez, alertou uma vez).
export async function ticketIdsWithSlaAtRiskNotification(ticketIds: string[]): Promise<Set<string>> {
  if (ticketIds.length === 0) return new Set();
  const rows = await db
    .selectDistinct({ ticketId: helpdeskNotifications.ticketId })
    .from(helpdeskNotifications)
    .where(
      and(
        eq(helpdeskNotifications.kind, "sla_at_risk"),
        inArray(helpdeskNotifications.ticketId, ticketIds),
      ),
    );
  return new Set(rows.map((row) => row.ticketId));
}

export async function listNotificationsForUser(
  recipientUserId: string,
  limit: number = HELPDESK_NOTIFICATIONS_PAGE_SIZE,
): Promise<HelpdeskNotificationView[]> {
  const rows = await db
    .select({
      id: helpdeskNotifications.id,
      ticketId: helpdeskNotifications.ticketId,
      kind: helpdeskNotifications.kind,
      summary: helpdeskNotifications.summary,
      readAt: helpdeskNotifications.readAt,
      createdAt: helpdeskNotifications.createdAt,
      queueKey: queues.key,
      seq: tickets.seq,
    })
    .from(helpdeskNotifications)
    .innerJoin(tickets, eq(tickets.id, helpdeskNotifications.ticketId))
    .innerJoin(queues, eq(queues.id, tickets.queueId))
    .where(eq(helpdeskNotifications.recipientUserId, recipientUserId))
    .orderBy(desc(helpdeskNotifications.createdAt))
    .limit(Math.max(1, Math.min(limit, 100)));

  return rows.map((row) => ({
    id: row.id,
    ticketId: row.ticketId,
    reference: formatTicketReference({ queueKey: row.queueKey, seq: row.seq }),
    kind: row.kind as HelpdeskNotificationKind,
    summary: row.summary,
    readAt: row.readAt,
    createdAt: row.createdAt,
  }));
}

export async function countUnreadForUser(recipientUserId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(helpdeskNotifications)
    .where(and(eq(helpdeskNotifications.recipientUserId, recipientUserId), isNull(helpdeskNotifications.readAt)));
  return row?.count ?? 0;
}

// Marca como lidas as notificações não lidas do usuário. `ids` vazio/omitido = todas as não
// lidas. Só toca linhas do próprio usuário (o filtro por recipientUserId garante isso). Devolve
// quantas foram marcadas.
export async function markNotificationsReadForUser(recipientUserId: string, ids: string[]): Promise<number> {
  const conditions = [
    eq(helpdeskNotifications.recipientUserId, recipientUserId),
    isNull(helpdeskNotifications.readAt),
  ];
  if (ids.length > 0) {
    conditions.push(inArray(helpdeskNotifications.id, ids));
  }
  const updated = await db
    .update(helpdeskNotifications)
    .set({ readAt: new Date() })
    .where(and(...conditions))
    .returning({ id: helpdeskNotifications.id });
  return updated.length;
}
