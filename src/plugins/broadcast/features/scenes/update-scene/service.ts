import { beginOperation, endOperation } from "@/observability";
import { applySceneUpdate, findSceneById } from "./store";
import type { UpdateSceneCommand, UpdateSceneResult } from "./types";

export async function updateScene(command: UpdateSceneCommand): Promise<UpdateSceneResult> {
  const handle = beginOperation({
    useCase: "broadcast.update-scene",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findSceneById(command.sceneId);
  if (!existing) {
    const error = { code: "broadcast.update-scene.not_found", message: "Cena não encontrada." };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const record = await applySceneUpdate({ id: command.sceneId, name: command.name.trim(), order: command.order });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
