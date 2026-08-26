import { authorizeActor } from "@/contexts/rbac";
import { updateProgram } from "./service";
import { validateUpdateProgramInput } from "./validation";
import type { UpdateProgramInput, UpdateProgramResult } from "./types";

export async function updateProgramHandler(input: UpdateProgramInput): Promise<UpdateProgramResult> {
  const validationError = validateUpdateProgramInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor("enrollment-dashboard.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return updateProgram({ ...input, actorId: authz.actorId });
}
