import { authorizeActor } from "@/contexts/rbac";
import { authorizeQueueConfigActor } from "../../../shared/scoped-authorization";
import { setQueueMembers } from "./service";
import type { SetQueueMembersInput, SetQueueMembersResult } from "./types";

// helpdesk.manage delega qualquer papel (inclusive manager). Um "manager" de fila delega só
// "agent" — a checagem fina fica no service (canManageManagers).
export async function setQueueMembersHandler(input: SetQueueMembersInput): Promise<SetQueueMembersResult> {
  if (!input.queueId || input.queueId.trim().length === 0) {
    return { success: false, error: { code: "helpdesk.set-queue-members.missing_queue", message: "Fila não informada." } };
  }

  const full = await authorizeActor("helpdesk.manage");
  if (full.authorized) {
    return setQueueMembers({ ...input, canManageManagers: true, actorId: full.actorId });
  }

  const scoped = await authorizeQueueConfigActor(input.queueId);
  if (!scoped.authorized) {
    return { success: false, error: scoped.error };
  }

  return setQueueMembers({ ...input, canManageManagers: false, actorId: scoped.actorId });
}
