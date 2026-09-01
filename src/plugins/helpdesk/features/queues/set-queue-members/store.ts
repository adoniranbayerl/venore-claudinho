import { and, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { queueMembers, queues } from "../../../database/schema";
import type { QueueMemberRole, QueueRecord } from "../../../contracts/types";
import type { QueueMemberAssignment } from "./types";

export async function findQueueById(id: string): Promise<QueueRecord | null> {
  const [row] = await db.select().from(queues).where(eq(queues.id, id)).limit(1);
  return (row as QueueRecord) ?? null;
}

export async function findManagerUserIds(queueId: string): Promise<string[]> {
  const rows = await db
    .select({ userId: queueMembers.userId })
    .from(queueMembers)
    .where(and(eq(queueMembers.queueId, queueId), eq(queueMembers.role, "manager")));
  return rows.map((row) => row.userId);
}

// Substitui o conjunto inteiro de membros da fila — mesmo padrão de
// company-metrics replaceSectorMembers. members=[] é estado válido.
export async function replaceQueueMembers(queueId: string, members: QueueMemberAssignment[]): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(queueMembers).where(eq(queueMembers.queueId, queueId));
    if (members.length > 0) {
      await tx
        .insert(queueMembers)
        .values(members.map((member) => ({ queueId, userId: member.userId, role: member.role as QueueMemberRole })));
    }
  });
}
