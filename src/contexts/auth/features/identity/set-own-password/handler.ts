import { getCurrentUserService } from "../../session/get-current-user/service";
import { setOwnPassword } from "./service";
import type { SetOwnPasswordInput, SetOwnPasswordResult } from "./types";

// Self-service: o ator é sempre a sessão atual — não há permission pra editar a própria
// credencial (mesmo raciocínio de update-own-avatar). Sem RBAC.
export async function setOwnPasswordHandler(input: SetOwnPasswordInput): Promise<SetOwnPasswordResult> {
  const currentUser = await getCurrentUserService();
  if (!currentUser.success || !currentUser.data) {
    return {
      success: false,
      error: {
        code: "auth.identity.unauthenticated",
        message: "É necessário estar autenticado para executar esta operação.",
      },
    };
  }

  return setOwnPassword({ actorId: currentUser.data.id, newPassword: input.newPassword });
}
