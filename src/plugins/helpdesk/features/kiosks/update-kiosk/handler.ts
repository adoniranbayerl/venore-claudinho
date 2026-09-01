import { authorizeActor } from "@/contexts/rbac";
import { updateKiosk } from "./service";
import { validateUpdateKioskInput } from "./validation";
import type { UpdateKioskInput, UpdateKioskResult } from "./types";

export async function updateKioskHandler(input: UpdateKioskInput): Promise<UpdateKioskResult> {
  const validationError = validateUpdateKioskInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor("helpdesk.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return updateKiosk({ ...input, actorId: authz.actorId });
}
