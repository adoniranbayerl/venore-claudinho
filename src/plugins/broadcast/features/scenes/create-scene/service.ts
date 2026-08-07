import { beginOperation, endOperation } from "@/observability";
import { findMaxSceneOrder, insertScene } from "./store";
import type { CreateSceneCommand, CreateSceneResult } from "./types";

export async function createScene(command: CreateSceneCommand): Promise<CreateSceneResult> {
  const handle = beginOperation({
    useCase: "broadcast.create-scene",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const nextOrder = (await findMaxSceneOrder()) + 1;
  const record = await insertScene({ key: command.key, name: command.name.trim(), order: nextOrder });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
