import { deleteSceneById } from "./store";
import type { DeleteSceneInput, DeleteSceneResult } from "./types";

export async function deleteScene(input: DeleteSceneInput): Promise<DeleteSceneResult> {
  const deleted = await deleteSceneById(input.sceneId);
  if (!deleted) {
    return { success: false, error: { code: "broadcast.delete-scene.not_found", message: "Cena não encontrada." } };
  }
  return { success: true, data: { id: input.sceneId } };
}
