import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { queueMembers } from "../../../database/schema";
import type { QueueMemberRole } from "../../../contracts/types";

export async function findMembershipsForUser(userId: string): Promise<{ queueId: string; role: QueueMemberRole }[]> {
  const rows = await db
    .select({ queueId: queueMembers.queueId, role: queueMembers.role })
    .from(queueMembers)
    .where(eq(queueMembers.userId, userId));
  return rows.map((row) => ({ queueId: row.queueId, role: row.role as QueueMemberRole }));
}
