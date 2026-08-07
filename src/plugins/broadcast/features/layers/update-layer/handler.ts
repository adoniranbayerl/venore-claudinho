import { authorizeActor } from "@/contexts/rbac";
import { updateLayer } from "./service";
import { validateUpdateLayerInput } from "./validation";
import type { UpdateLayerInput, UpdateLayerResult } from "./types";

export async function updateLayerHandler(input: UpdateLayerInput): Promise<UpdateLayerResult> {
  const validationError = validateUpdateLayerInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor("broadcast.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return updateLayer({ ...input, actorId: authz.actorId });
}
