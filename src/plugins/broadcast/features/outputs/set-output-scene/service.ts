import { beginOperation, endOperation } from "@/observability";
import { publishOutputEvent } from "../../../runtime/output-bus";
import { applyOutputScene, findOutputById, findSceneById } from "./store";
import type { SetOutputSceneCommand, SetOutputSceneResult } from "./types";

export async function setOutputScene(command: SetOutputSceneCommand): Promise<SetOutputSceneResult> {
  const output = await findOutputById(command.outputId);
  if (!output) {
    return { success: false, error: { code: "broadcast.set-output-scene.not_found", message: "Saída não encontrada." } };
  }

  if (command.sceneId) {
    const scene = await findSceneById(command.sceneId);
    if (!scene) {
      return {
        success: false,
        error: { code: "broadcast.set-output-scene.scene_not_found", message: "Cena não encontrada." },
      };
    }
  }

  const handle = beginOperation({
    useCase: "broadcast.set-output-scene",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const record = await applyOutputScene({ id: command.outputId, sceneId: command.sceneId });

  endOperation(handle, { success: true });
  publishOutputEvent(output.token, { type: "scene-changed", sceneId: command.sceneId });

  return { success: true, data: record };
}
