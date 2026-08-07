import { authorizeActor } from "@/contexts/rbac";
import { deleteAgendaEvent } from "./service";
import type { DeleteAgendaEventInput, DeleteAgendaEventResult } from "./types";

export async function deleteAgendaEventHandler(input: DeleteAgendaEventInput): Promise<DeleteAgendaEventResult> {
  const authz = await authorizeActor("broadcast.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return deleteAgendaEvent(input);
}
