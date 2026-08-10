import { authorizeActor } from "@/contexts/rbac";
import { BROADCAST_AGENDA_PERMISSIONS } from "../../../shared/permissions";
import { listAgendas } from "./service";
import type { ListAgendasResult } from "./types";

export async function listAgendasHandler(): Promise<ListAgendasResult> {
  const authz = await authorizeActor(BROADCAST_AGENDA_PERMISSIONS);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listAgendas();
}
