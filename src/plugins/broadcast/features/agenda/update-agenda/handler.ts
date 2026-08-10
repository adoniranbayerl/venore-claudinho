import { authorizeActor } from "@/contexts/rbac";
import { BROADCAST_AGENDA_PERMISSIONS } from "../../../shared/permissions";
import { updateAgenda } from "./service";
import { validateUpdateAgendaInput } from "./validation";
import type { UpdateAgendaInput, UpdateAgendaResult } from "./types";

export async function updateAgendaHandler(input: UpdateAgendaInput): Promise<UpdateAgendaResult> {
  const validationError = validateUpdateAgendaInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor(BROADCAST_AGENDA_PERMISSIONS);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return updateAgenda({ ...input, actorId: authz.actorId });
}
