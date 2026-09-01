import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { queues } from "../../../database/schema";
import type { QueueRecord, TicketPriority } from "../../../contracts/types";

export async function findQueueById(id: string): Promise<QueueRecord | null> {
  const [row] = await db.select().from(queues).where(eq(queues.id, id)).limit(1);
  return (row as QueueRecord) ?? null;
}

// key nunca é atualizada — ver create-queue/service.ts. `defaultPriority` só entra no UPDATE
// quando o comando o traz (undefined = mantém).
export async function updateQueueRow(
  id: string,
  input: { name: string; description: string | null; icon: string | null; defaultPriority?: TicketPriority },
): Promise<QueueRecord> {
  const set: Record<string, unknown> = {
    name: input.name,
    description: input.description,
    icon: input.icon,
    updatedAt: new Date(),
  };
  if (input.defaultPriority !== undefined) set.defaultPriority = input.defaultPriority;

  const [row] = await db.update(queues).set(set).where(eq(queues.id, id)).returning();
  return row as QueueRecord;
}
