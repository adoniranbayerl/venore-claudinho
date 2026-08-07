import { authorizeActor } from "@/contexts/rbac";
import { createScene } from "./service";
import { validateCreateSceneInput } from "./validation";
import type { CreateSceneInput, CreateSceneResult } from "./types";

export async function createSceneHandler(input: CreateSceneInput): Promise<CreateSceneResult> {
  const validationError = validateCreateSceneInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor("broadcast.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createScene({ ...input, actorId: authz.actorId });
}
