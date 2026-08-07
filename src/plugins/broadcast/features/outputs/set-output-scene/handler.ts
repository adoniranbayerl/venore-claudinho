import { authorizeActor } from "@/contexts/rbac";
import { setOutputScene } from "./service";
import { validateSetOutputSceneInput } from "./validation";
import type { SetOutputSceneInput, SetOutputSceneResult } from "./types";

export async function setOutputSceneHandler(input: SetOutputSceneInput): Promise<SetOutputSceneResult> {
  const validationError = validateSetOutputSceneInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor("broadcast.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return setOutputScene({ ...input, actorId: authz.actorId });
}
