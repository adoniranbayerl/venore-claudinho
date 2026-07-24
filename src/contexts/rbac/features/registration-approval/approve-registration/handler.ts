import { authorizeActor } from "../../../authorize-actor";
import { approveRegistration } from "./service";
import type { ApproveRegistrationInput, ApproveRegistrationResult } from "./types";

export async function approveRegistrationHandler(input: ApproveRegistrationInput): Promise<ApproveRegistrationResult> {
  if (input.userId.trim().length === 0) {
    return { success: false, error: { code: "rbac.registrations.invalid_id", message: "userId não pode ser vazio." } };
  }

  const authz = await authorizeActor("rbac.registrations.approve");
  if (!authz.authorized) return { success: false, error: authz.error };

  return approveRegistration({ ...input, actor: { id: authz.actorId } });
}
