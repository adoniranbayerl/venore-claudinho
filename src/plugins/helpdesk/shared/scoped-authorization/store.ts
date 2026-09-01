import { and, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { categories, queueMembers, queues } from "../../database/schema";
import type { QueueMemberRole, QueueRecord } from "../../contracts/types";

// Acesso a banco fora de um store.ts por feature — exceção deliberada, mesmo racional de
// company-metrics/shared/scoped-authorization/store.ts: esta checagem de "é membro desta fila e
// com que papel" é usada por handlers espalhados por várias features (queues, categories, e
// depois tickets/notifications), e nenhuma é dona natural dela.

const ROLE_RANK: Record<QueueMemberRole, number> = { agent: 1, manager: 2 };

export function roleSatisfies(actual: QueueMemberRole | null, min: QueueMemberRole): boolean {
  return actual !== null && ROLE_RANK[actual] >= ROLE_RANK[min];
}

export async function findQueueMemberRole(queueId: string, userId: string): Promise<QueueMemberRole | null> {
  const [row] = await db
    .select({ role: queueMembers.role })
    .from(queueMembers)
    .where(and(eq(queueMembers.queueId, queueId), eq(queueMembers.userId, userId)))
    .limit(1);
  return (row?.role as QueueMemberRole) ?? null;
}

// Filas em que a pessoa é membro com papel >= minRole. Usado pelas listagens quando o ator só
// tem a permission estreita (helpdesk.work), não a ampla (helpdesk.manage).
export async function findQueueIdsForUser(userId: string, minRole: QueueMemberRole = "agent"): Promise<string[]> {
  const rows = await db
    .select({ queueId: queueMembers.queueId, role: queueMembers.role })
    .from(queueMembers)
    .where(eq(queueMembers.userId, userId));
  return rows.filter((row) => roleSatisfies(row.role as QueueMemberRole, minRole)).map((row) => row.queueId);
}

export async function findQueueById(id: string): Promise<QueueRecord | null> {
  const [row] = await db.select().from(queues).where(eq(queues.id, id)).limit(1);
  return (row as QueueRecord) ?? null;
}

// update-category/archive-category só recebem categoryId — resolve a fila pai antes de checar
// autorização (mesmo padrão de company-metrics findSectorIdByGroupId).
export async function findQueueIdByCategoryId(categoryId: string): Promise<string | null> {
  const [row] = await db.select({ queueId: categories.queueId }).from(categories).where(eq(categories.id, categoryId)).limit(1);
  return row?.queueId ?? null;
}
