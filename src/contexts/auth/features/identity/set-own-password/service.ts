import { beginOperation, endOperation } from "@/observability";
import { hashPassword } from "../password-hashing";
import { writeOwnPasswordHash } from "./store";
import type { SetOwnPasswordCommand, SetOwnPasswordResult } from "./types";

const MIN_PASSWORD_LENGTH = 8;

export async function setOwnPassword(command: SetOwnPasswordCommand): Promise<SetOwnPasswordResult> {
  const handle = beginOperation({
    useCase: "auth.identity.set-own-password",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  if (command.newPassword.length < MIN_PASSWORD_LENGTH) {
    const error = {
      code: "auth.identity.weak_password",
      message: `A senha precisa ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const passwordHash = await hashPassword(command.newPassword);
  const updated = await writeOwnPasswordHash(command.actorId, passwordHash);
  if (!updated) {
    const error = {
      code: "auth.identity.user_not_found",
      message: "Usuário não encontrado para atualizar a senha.",
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  endOperation(handle, { success: true, summary: `Usuário ${command.actorId} definiu a própria senha.` });
  return { success: true, data: { id: updated.id } };
}
