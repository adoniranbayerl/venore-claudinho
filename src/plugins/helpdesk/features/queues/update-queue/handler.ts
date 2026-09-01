import { authorizeActor } from "@/contexts/rbac";
import { updateQueue } from "./service";
import { validateUpdateQueueInput } from "./validation";
import type { UpdateQueueInput, UpdateQueueResult } from "./types";

// Editar nome/descrição/ícone da fila é ação do administrador do plugin — helpdesk.manage. Um
// "manager" de fila configura categorias e agentes, não a identidade da própria fila.
export async function updateQueueHandler(input: UpdateQueueInput): Promise<UpdateQueueResult> {
  const validationError = validateUpdateQueueInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor("helpdesk.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return updateQueue({ ...input, actorId: authz.actorId });
}
