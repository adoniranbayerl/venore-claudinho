"use server";

import { saveWebPushSubscription, deleteWebPushSubscription } from "@/contexts/web-push";
import type { WebPushSubscriptionInput } from "@/contexts/web-push";

export async function savePushSubscriptionAction(input: WebPushSubscriptionInput): Promise<{ error: string | null }> {
  const result = await saveWebPushSubscription(input);
  return { error: result.success ? null : result.error.message };
}

export async function deletePushSubscriptionAction(endpoint: string): Promise<{ error: string | null }> {
  const result = await deleteWebPushSubscription({ endpoint });
  return { error: result.success ? null : result.error.message };
}
