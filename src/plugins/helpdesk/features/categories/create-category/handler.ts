import { authorizeQueueConfigActor } from "../../../shared/scoped-authorization";
import { createCategory } from "./service";
import { validateCreateCategoryInput } from "./validation";
import type { CreateCategoryInput, CreateCategoryResult } from "./types";

// Configurar categoria de uma fila = helpdesk.manage OU ser "manager" da fila.
export async function createCategoryHandler(input: CreateCategoryInput): Promise<CreateCategoryResult> {
  const validationError = validateCreateCategoryInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeQueueConfigActor(input.queueId);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createCategory({ ...input, actorId: authz.actorId });
}
