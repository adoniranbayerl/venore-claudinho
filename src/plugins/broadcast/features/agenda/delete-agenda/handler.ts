import { authorizeActor } from "@/contexts/rbac";
import { deleteAgenda } from "./service";
import type { DeleteAgendaInput, DeleteAgendaResult } from "./types";

export async function deleteAgendaHandler(input: DeleteAgendaInput): Promise<DeleteAgendaResult> {
  const authz = await authorizeActor("broadcast.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return deleteAgenda(input);
}
