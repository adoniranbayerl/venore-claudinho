import { beginOperation, endOperation } from "@/observability";
import { updateUserStatus } from "./store";
import type { ProvisionUserCommand, ProvisionUserResult } from "./types";

// Marca o usuário recém-criado como pending. Não decide se isso deve acontecer (aprovação
// ligada/desligada) nem concede papel — isso é composição de auth + rbac e mora fora de
// ambos os contexts, em src/platform/registration/handle-user-registered.ts (docs/venore-docks.md
// — regra 12: auth não pode depender de rbac, que já depende de auth).
export async function provisionUser(command: ProvisionUserCommand): Promise<ProvisionUserResult> {
  const handle = beginOperation({
    useCase: "auth.identity.provision-user",
    actor: { id: command.id, type: "user" },
    kind: "write",
  });

  await updateUserStatus(command.id, "pending");

  endOperation(handle, { success: true });
  return { success: true, data: undefined };
}
