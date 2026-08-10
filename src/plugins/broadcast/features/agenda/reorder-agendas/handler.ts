import { authorizeActor } from "@/contexts/rbac";
import { BROADCAST_AGENDA_PERMISSIONS } from "../../../shared/permissions";
import { reorderAgendasService } from "./service";
import type { ReorderAgendasInput, ReorderAgendasResult } from "./types";

export async function reorderAgendasHandler(input: ReorderAgendasInput): Promise<ReorderAgendasResult> {
  if (input.agendaIds.length === 0) {
    return {
      success: false,
      error: { code: "broadcast.reorder-agendas.invalid_agendas", message: "Lista de agendas não pode ser vazia." },
    };
  }

  const authz = await authorizeActor(BROADCAST_AGENDA_PERMISSIONS);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return reorderAgendasService({ ...input, actorId: authz.actorId });
}
