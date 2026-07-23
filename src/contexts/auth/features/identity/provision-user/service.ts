import { beginOperation, endOperation } from "@/observability";
import type { ProvisionUserCommand, ProvisionUserResult } from "./types";

export async function provisionUser(command: ProvisionUserCommand): Promise<ProvisionUserResult> {
  const handle = beginOperation({
    useCase: "auth.identity.provision-user",
    actor: { id: command.id, type: "user" },
    kind: "write",
  });

  endOperation(handle, { success: true });

  return { success: true, data: undefined };
}
