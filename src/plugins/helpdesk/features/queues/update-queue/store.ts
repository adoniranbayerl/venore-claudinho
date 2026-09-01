import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { queues } from "../../../database/schema";
import type { QueueRecord } from "../../../contracts/types";

export async function findQueueById(id: string): Promise<QueueRecord | null> {
  const [row] = await db.select().from(queues).where(eq(queues.id, id)).limit(1);
  return (row as QueueRecord) ?? null;
}

// key nunca é atualizada — ver create-queue/service.ts.
export async function updateQueueRow(
  id: string,
  input: { name: string; description: string | null; icon: string | null },
): Promise<QueueRecord> {
  const [row] = await db
    .update(queues)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(queues.id, id))
    .returning();
  return row as QueueRecord;
}
