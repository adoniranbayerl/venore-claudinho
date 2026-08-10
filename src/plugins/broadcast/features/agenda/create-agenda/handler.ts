import { authorizeActor } from "@/contexts/rbac";
import { BROADCAST_AGENDA_PERMISSIONS } from "../../../shared/permissions";
import { createAgenda } from "./service";
import { validateCreateAgendaInput } from "./validation";
import type { CreateAgendaInput, CreateAgendaResult } from "./types";

export async function createAgendaHandler(input: CreateAgendaInput): Promise<CreateAgendaResult> {
  const validationError = validateCreateAgendaInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor(BROADCAST_AGENDA_PERMISSIONS);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createAgenda({ ...input, actorId: authz.actorId });
}
