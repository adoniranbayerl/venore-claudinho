import { beginOperation, endOperation } from "@/observability";
import { applyLayerUpdate, findLayerById } from "./store";
import type { UpdateLayerCommand, UpdateLayerResult } from "./types";

export async function updateLayer(command: UpdateLayerCommand): Promise<UpdateLayerResult> {
  const handle = beginOperation({
    useCase: "broadcast.update-layer",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findLayerById(command.layerId);
  if (!existing) {
    const error = { code: "broadcast.update-layer.not_found", message: "Layer não encontrada." };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const record = await applyLayerUpdate({
    id: command.layerId,
    name: command.name.trim(),
    x: command.x,
    y: command.y,
    width: command.width,
    height: command.height,
    zIndex: command.zIndex,
    config: command.config,
    visible: command.visible,
  });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
