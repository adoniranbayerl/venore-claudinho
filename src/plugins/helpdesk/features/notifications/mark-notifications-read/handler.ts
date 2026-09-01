import { getCurrentUser } from "@/contexts/auth";
import { markNotificationsRead } from "./service";
import type { MarkNotificationsReadInput, MarkNotificationsReadResult } from "./types";

const UNAUTHENTICATED = {
  code: "helpdesk.mark-notifications-read.unauthenticated",
  message: "É necessário estar autenticado.",
} as const;

export async function markNotificationsReadHandler(
  input: MarkNotificationsReadInput = {},
): Promise<MarkNotificationsReadResult> {
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return { success: false, error: UNAUTHENTICATED };
  }

  const ids = (input.ids ?? []).filter((id) => typeof id === "string" && id.trim().length > 0);
  return markNotificationsRead(currentUser.data.id, ids);
}
