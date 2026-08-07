import { authorizeActor } from "@/contexts/rbac";
import { updateScene } from "./service";
import { validateUpdateSceneInput } from "./validation";
import type { UpdateSceneInput, UpdateSceneResult } from "./types";

export async function updateSceneHandler(input: UpdateSceneInput): Promise<UpdateSceneResult> {
  const validationError = validateUpdateSceneInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor("broadcast.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return updateScene({ ...input, actorId: authz.actorId });
}
