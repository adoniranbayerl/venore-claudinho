import { beginOperation, endOperation } from "@/observability";
import { insertOutput } from "./store";
import type { CreateOutputCommand, CreateOutputResult } from "./types";

export async function createOutput(command: CreateOutputCommand): Promise<CreateOutputResult> {
  const handle = beginOperation({
    useCase: "broadcast.create-output",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const record = await insertOutput({ name: command.name.trim() });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
