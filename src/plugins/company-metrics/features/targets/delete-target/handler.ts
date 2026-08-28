import { authorizeTargetConfigActor } from "../../../shared/scoped-authorization";
import { deleteTarget } from "./service";
import type { DeleteTargetInput, DeleteTargetResult } from "./types";

export async function deleteTargetHandler(input: DeleteTargetInput): Promise<DeleteTargetResult> {
  if (!input.targetId || input.targetId.trim().length === 0) {
    return { success: false, error: { code: "company-metrics.delete-target.missing_target", message: "Meta não informada." } };
  }

  const authz = await authorizeTargetConfigActor(input.targetId);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return deleteTarget({ ...input, actorId: authz.actorId });
}
