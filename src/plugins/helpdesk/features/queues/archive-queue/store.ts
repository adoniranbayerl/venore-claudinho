import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { queues } from "../../../database/schema";
import type { QueueRecord } from "../../../contracts/types";

export async function findQueueById(id: string): Promise<QueueRecord | null> {
  const [row] = await db.select().from(queues).where(eq(queues.id, id)).limit(1);
  return (row as QueueRecord) ?? null;
}

export async function setQueueArchived(id: string, archivedAt: Date | null): Promise<QueueRecord> {
  const [row] = await db.update(queues).set({ archivedAt, updatedAt: new Date() }).where(eq(queues.id, id)).returning();
  return row as QueueRecord;
}
