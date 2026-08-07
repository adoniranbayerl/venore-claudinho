import { authorizeActor } from "@/contexts/rbac";
import { listAgendaEvents } from "./service";
import type { ListAgendaEventsResult } from "./types";

export async function listAgendaEventsHandler(): Promise<ListAgendaEventsResult> {
  const authz = await authorizeActor("broadcast.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listAgendaEvents();
}
