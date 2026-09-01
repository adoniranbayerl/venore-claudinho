import { findQueueMembers } from "./store";
import type { ListQueueMembersResult } from "./types";

export async function listQueueMembers(queueId: string): Promise<ListQueueMembersResult> {
  return { success: true, data: await findQueueMembers(queueId) };
}
