import { authorizeActor } from "@/contexts/rbac";
import { deleteLayer } from "./service";
import type { DeleteLayerInput, DeleteLayerResult } from "./types";

export async function deleteLayerHandler(input: DeleteLayerInput): Promise<DeleteLayerResult> {
  const authz = await authorizeActor("broadcast.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return deleteLayer(input);
}
