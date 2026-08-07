import { beginOperation, endOperation } from "@/observability";
import { insertLayer } from "./store";
import type { CreateLayerCommand, CreateLayerResult } from "./types";

// x/y/width/height em percentual (0-100) por convenção (contracts/types.ts), mas o service não
// força o range — uma layer parcialmente fora do viewport (drawer entrando pela borda, Fase 5) é
// um caso válido, não um erro.
export async function createLayer(command: CreateLayerCommand): Promise<CreateLayerResult> {
  const handle = beginOperation({
    useCase: "broadcast.create-layer",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const record = await insertLayer({
    sceneId: command.sceneId,
    type: command.type,
    name: command.name.trim(),
    x: command.x ?? 0,
    y: command.y ?? 0,
    width: command.width ?? 100,
    height: command.height ?? 100,
    zIndex: command.zIndex ?? 0,
    config: command.config ?? {},
    visible: command.visible ?? true,
  });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
