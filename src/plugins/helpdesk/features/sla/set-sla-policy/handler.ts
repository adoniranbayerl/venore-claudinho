import { authorizeQueueConfigActor } from "../../../shared/scoped-authorization";
import { setSlaPolicy } from "./service";
import { validateSetSlaPolicyInput } from "./validation";
import type { SetSlaPolicyInput, SetSlaPolicyResult } from "./types";

// Configurar o SLA de uma fila = helpdesk.manage OU ser "manager" da fila (mesmo gate de
// create-category — aba "Filas & SLA", §4).
export async function setSlaPolicyHandler(input: SetSlaPolicyInput): Promise<SetSlaPolicyResult> {
  const validationError = validateSetSlaPolicyInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeQueueConfigActor(input.queueId);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return setSlaPolicy({ ...input, actorId: authz.actorId });
}
