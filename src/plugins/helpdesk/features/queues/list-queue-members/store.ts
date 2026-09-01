import { asc, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { queueMembers } from "../../../database/schema";
import type { QueueMemberRecord } from "../../../contracts/types";

export async function findQueueMembers(queueId: string): Promise<QueueMemberRecord[]> {
  const rows = await db
    .select()
    .from(queueMembers)
    .where(eq(queueMembers.queueId, queueId))
    .orderBy(asc(queueMembers.role), asc(queueMembers.assignedAt));
  return rows as QueueMemberRecord[];
}
