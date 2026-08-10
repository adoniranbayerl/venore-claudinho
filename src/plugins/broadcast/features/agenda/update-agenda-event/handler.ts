import { authorizeActor } from "@/contexts/rbac";
import { BROADCAST_AGENDA_PERMISSIONS } from "../../../shared/permissions";
import { updateAgendaEvent } from "./service";
import { validateUpdateAgendaEventInput } from "./validation";
import type { UpdateAgendaEventInput, UpdateAgendaEventResult } from "./types";

export async function updateAgendaEventHandler(input: UpdateAgendaEventInput): Promise<UpdateAgendaEventResult> {
  const validationError = validateUpdateAgendaEventInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor(BROADCAST_AGENDA_PERMISSIONS);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return updateAgendaEvent({ ...input, actorId: authz.actorId });
}
