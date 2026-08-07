import { authorizeActor } from "@/contexts/rbac";
import { listAgendas } from "./service";
import type { ListAgendasResult } from "./types";

export async function listAgendasHandler(): Promise<ListAgendasResult> {
  const authz = await authorizeActor("broadcast.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listAgendas();
}
