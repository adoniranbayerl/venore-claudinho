import { authorizeActor } from "@/contexts/rbac";
import { updateInstitution } from "./service";
import { validateUpdateInstitutionInput } from "./validation";
import type { UpdateInstitutionInput, UpdateInstitutionResult } from "./types";

export async function updateInstitutionHandler(input: UpdateInstitutionInput): Promise<UpdateInstitutionResult> {
  const validationError = validateUpdateInstitutionInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor("enrollment-dashboard.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return updateInstitution({ ...input, actorId: authz.actorId });
}
