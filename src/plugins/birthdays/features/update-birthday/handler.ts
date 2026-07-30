import { authorizeActor } from "@/contexts/rbac";
import { updateBirthday } from "./service";
import { validateUpdateBirthdayInput } from "./validation";
import type { UpdateBirthdayInput, UpdateBirthdayResult } from "./types";

export async function updateBirthdayHandler(input: UpdateBirthdayInput): Promise<UpdateBirthdayResult> {
  const validationError = validateUpdateBirthdayInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor("birthdays.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return updateBirthday({ ...input, actorId: authz.actorId });
}
