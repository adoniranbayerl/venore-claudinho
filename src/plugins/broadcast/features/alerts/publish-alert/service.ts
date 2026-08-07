import { beginOperation, endOperation } from "@/observability";
import { insertAlert } from "./store";
import type { PublishAlertCommand, PublishAlertResult } from "./types";

export async function publishAlert(command: PublishAlertCommand): Promise<PublishAlertResult> {
  const handle = beginOperation({
    useCase: "broadcast.publish-alert",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const expiresAt = new Date(Date.now() + command.durationSeconds * 1000);
  const record = await insertAlert({ message: command.message.trim(), expiresAt });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
