import { authorizeActor } from "@/contexts/rbac";
import { createLayer } from "./service";
import { validateCreateLayerInput } from "./validation";
import type { CreateLayerInput, CreateLayerResult } from "./types";

export async function createLayerHandler(input: CreateLayerInput): Promise<CreateLayerResult> {
  const validationError = validateCreateLayerInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor("broadcast.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createLayer({ ...input, actorId: authz.actorId });
}
