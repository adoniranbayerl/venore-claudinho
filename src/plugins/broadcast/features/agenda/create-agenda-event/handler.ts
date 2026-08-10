import { authorizeActor } from "@/contexts/rbac";
import { BROADCAST_AGENDA_PERMISSIONS } from "../../../shared/permissions";
import { createAgendaEvent } from "./service";
import { validateCreateAgendaEventInput } from "./validation";
import type { CreateAgendaEventInput, CreateAgendaEventResult } from "./types";

export async function createAgendaEventHandler(input: CreateAgendaEventInput): Promise<CreateAgendaEventResult> {
  const validationError = validateCreateAgendaEventInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor(BROADCAST_AGENDA_PERMISSIONS);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createAgendaEvent({ ...input, actorId: authz.actorId });
}
