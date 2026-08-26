import { authorizeActor } from "@/contexts/rbac";
import { createInstitution } from "./service";
import { validateCreateInstitutionInput } from "./validation";
import type { CreateInstitutionInput, CreateInstitutionResult } from "./types";

export async function createInstitutionHandler(input: CreateInstitutionInput): Promise<CreateInstitutionResult> {
  const validationError = validateCreateInstitutionInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor("enrollment-dashboard.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createInstitution({ ...input, actorId: authz.actorId });
}
