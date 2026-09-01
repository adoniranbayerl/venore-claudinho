import { authorizeActor } from "@/contexts/rbac";
import { createQueue } from "./service";
import { validateCreateQueueInput } from "./validation";
import type { CreateQueueInput, CreateQueueResult } from "./types";

// Criar fila é ação do administrador do plugin — helpdesk.manage, nunca escopada (não dá pra
// escopar algo que ainda não existe).
export async function createQueueHandler(input: CreateQueueInput): Promise<CreateQueueResult> {
  const validationError = validateCreateQueueInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor("helpdesk.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createQueue({ ...input, actorId: authz.actorId });
}
