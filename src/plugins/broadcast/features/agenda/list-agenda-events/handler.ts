import { authorizeActor } from "@/contexts/rbac";
import { BROADCAST_AGENDA_PERMISSIONS } from "../../../shared/permissions";
import { listAgendaEvents } from "./service";
import type { ListAgendaEventsResult } from "./types";

export async function listAgendaEventsHandler(): Promise<ListAgendaEventsResult> {
  const authz = await authorizeActor(BROADCAST_AGENDA_PERMISSIONS);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listAgendaEvents();
}
