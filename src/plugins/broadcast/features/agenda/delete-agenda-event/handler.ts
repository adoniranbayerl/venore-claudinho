import { authorizeActor } from "@/contexts/rbac";
import { BROADCAST_AGENDA_PERMISSIONS } from "../../../shared/permissions";
import { deleteAgendaEvent } from "./service";
import type { DeleteAgendaEventInput, DeleteAgendaEventResult } from "./types";

export async function deleteAgendaEventHandler(input: DeleteAgendaEventInput): Promise<DeleteAgendaEventResult> {
  const authz = await authorizeActor(BROADCAST_AGENDA_PERMISSIONS);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return deleteAgendaEvent(input);
}
