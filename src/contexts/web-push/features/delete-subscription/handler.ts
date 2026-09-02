import { getCurrentUser } from "@/contexts/auth";
import { deleteByEndpoint } from "../../shared/store";
import type { DeleteSubscriptionResult } from "../../contracts/types";

// Remove a inscrição de push do device atual (o usuário desligou os avisos). Best-effort: se o
// endpoint não bate com nada do usuário, `deleted` volta 0 sem erro.
export async function deleteSubscriptionHandler(input: { endpoint: string }): Promise<DeleteSubscriptionResult> {
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return { success: false, error: { code: "web-push.unauthenticated", message: "É necessário estar autenticado." } };
  }
  if (!input.endpoint) {
    return { success: false, error: { code: "web-push.invalid_subscription", message: "Endpoint ausente." } };
  }
  const deleted = await deleteByEndpoint(currentUser.data.id, input.endpoint);
  return { success: true, data: { deleted } };
}
