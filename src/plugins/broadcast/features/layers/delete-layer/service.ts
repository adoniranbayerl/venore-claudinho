import { deleteLayerById } from "./store";
import type { DeleteLayerInput, DeleteLayerResult } from "./types";

export async function deleteLayer(input: DeleteLayerInput): Promise<DeleteLayerResult> {
  const deleted = await deleteLayerById(input.layerId);
  if (!deleted) {
    return { success: false, error: { code: "broadcast.delete-layer.not_found", message: "Layer não encontrada." } };
  }
  return { success: true, data: { id: input.layerId } };
}
