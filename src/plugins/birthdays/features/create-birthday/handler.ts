import { authorizeActor } from "@/contexts/rbac";
import { createBirthday } from "./service";
import { validateCreateBirthdayInput } from "./validation";
import type { CreateBirthdayInput, CreateBirthdayResult } from "./types";

export async function createBirthdayHandler(input: CreateBirthdayInput): Promise<CreateBirthdayResult> {
  const validationError = validateCreateBirthdayInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor("birthdays.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createBirthday({ ...input, actorId: authz.actorId });
}
