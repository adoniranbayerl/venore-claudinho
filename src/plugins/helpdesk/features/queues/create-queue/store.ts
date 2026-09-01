import { eq, max } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { queues } from "../../../database/schema";
import type { QueueRecord } from "../../../contracts/types";

export async function queueKeyExists(key: string): Promise<boolean> {
  const [row] = await db.select({ id: queues.id }).from(queues).where(eq(queues.key, key)).limit(1);
  return Boolean(row);
}

export async function nextQueuePosition(): Promise<number> {
  const [row] = await db.select({ maxPosition: max(queues.position) }).from(queues);
  return (row?.maxPosition ?? 0) + 1;
}

export async function insertQueue(input: {
  key: string;
  name: string;
  description: string | null;
  icon: string | null;
  position: number;
}): Promise<QueueRecord> {
  const [row] = await db.insert(queues).values(input).returning();
  return row as QueueRecord;
}
