import { getCurrentUser } from "@/contexts/auth";
import { saveSubscription } from "./service";
import type { SaveSubscriptionResult, WebPushSubscriptionInput } from "../../contracts/types";

// Guarda a inscrição de push do device atual, atrelada ao usuário logado. Sem checagem de
// permissão — é dado próprio (mesmo critério de get-practice-streak no Academy).
export async function saveSubscriptionHandler(input: WebPushSubscriptionInput): Promise<SaveSubscriptionResult> {
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return { success: false, error: { code: "web-push.unauthenticated", message: "É necessário estar autenticado." } };
  }
  return saveSubscription(currentUser.data.id, input);
}
