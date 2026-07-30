import { authorizeActor } from "@/contexts/rbac";
import { deleteBirthday } from "./service";
import type { DeleteBirthdayInput, DeleteBirthdayResult } from "./types";

export async function deleteBirthdayHandler(input: DeleteBirthdayInput): Promise<DeleteBirthdayResult> {
  if (input.birthdayId.trim().length === 0) {
    return { success: false, error: { code: "birthdays.invalid_id", message: "birthdayId não pode ser vazio." } };
  }

  const authz = await authorizeActor("birthdays.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return deleteBirthday({ birthdayId: input.birthdayId, actorId: authz.actorId });
}
