import { authorizeActor } from "@/contexts/rbac";
import { createProgram } from "./service";
import { validateCreateProgramInput } from "./validation";
import type { CreateProgramInput, CreateProgramResult } from "./types";

export async function createProgramHandler(input: CreateProgramInput): Promise<CreateProgramResult> {
  const validationError = validateCreateProgramInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor("enrollment-dashboard.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createProgram({ ...input, actorId: authz.actorId });
}
