import { authorizeActor } from "@/contexts/rbac";
import { createAgenda } from "./service";
import { validateCreateAgendaInput } from "./validation";
import type { CreateAgendaInput, CreateAgendaResult } from "./types";

export async function createAgendaHandler(input: CreateAgendaInput): Promise<CreateAgendaResult> {
  const validationError = validateCreateAgendaInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor("broadcast.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createAgenda({ ...input, actorId: authz.actorId });
}
