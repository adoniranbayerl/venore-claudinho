import { beginOperation, endOperation } from "@/observability";
import { findUserStatus, updateUserStatus } from "./store";
import type { ApproveUserRegistrationInput, ApproveUserRegistrationResult } from "./types";

export async function approveUserRegistration(command: ApproveUserRegistrationInput): Promise<ApproveUserRegistrationResult> {
  const handle = beginOperation({
    useCase: "auth.registration.approve-user-registration",
    actor: { id: command.userId, type: "user" },
    kind: "write",
  });

  const status = await findUserStatus(command.userId);
  if (status !== "pending") {
    const error = { code: "auth.registrations.not_pending", message: `Usuário "${command.userId}" não está com registro pendente.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  await updateUserStatus(command.userId, "approved");
  endOperation(handle, { success: true });
  return { success: true, data: undefined };
}
