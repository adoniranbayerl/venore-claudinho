import { findMembershipsForUser } from "./store";
import type { HelpdeskAccess } from "./types";

export async function buildAccessForActor(
  actorId: string,
  flags: { canManageAll: boolean; canReadAll: boolean },
): Promise<HelpdeskAccess> {
  const memberships = await findMembershipsForUser(actorId);
  return {
    canManageAll: flags.canManageAll,
    canReadAll: flags.canReadAll,
    managerQueueIds: memberships.filter((m) => m.role === "manager").map((m) => m.queueId),
    memberQueueIds: memberships.map((m) => m.queueId),
  };
}
