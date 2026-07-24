// Sem authorizeActor: auth não depende de rbac (evitaria ciclo, ver provision-user/service.ts),
// logo não pode checar permissions. Só deve ser chamado por código que já autorizou o ator
// (hoje, exclusivamente rbac/features/registration-approval/approve-registration).
// Não usar diretamente de app/ ou plugins/.
import { approveUserRegistration } from "./service";
import type { ApproveUserRegistrationInput, ApproveUserRegistrationResult } from "./types";

export async function approveUserRegistrationHandler(input: ApproveUserRegistrationInput): Promise<ApproveUserRegistrationResult> {
  if (input.userId.trim().length === 0) {
    return { success: false, error: { code: "auth.registrations.invalid_id", message: "userId não pode ser vazio." } };
  }
  return approveUserRegistration(input);
}
