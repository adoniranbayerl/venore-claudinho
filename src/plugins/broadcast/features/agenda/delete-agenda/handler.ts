import { authorizeActor } from "@/contexts/rbac";
import { BROADCAST_AGENDA_PERMISSIONS } from "../../../shared/permissions";
import { deleteAgenda } from "./service";
import type { DeleteAgendaInput, DeleteAgendaResult } from "./types";

export async function deleteAgendaHandler(input: DeleteAgendaInput): Promise<DeleteAgendaResult> {
  const authz = await authorizeActor(BROADCAST_AGENDA_PERMISSIONS);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return deleteAgenda(input);
}
