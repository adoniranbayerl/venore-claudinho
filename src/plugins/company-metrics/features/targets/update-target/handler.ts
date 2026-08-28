import { authorizeTargetConfigActor } from "../../../shared/scoped-authorization";
import { updateTarget } from "./service";
import type { UpdateTargetInput, UpdateTargetResult } from "./types";

export async function updateTargetHandler(input: UpdateTargetInput): Promise<UpdateTargetResult> {
  if (!input.targetId || input.targetId.trim().length === 0) {
    return { success: false, error: { code: "company-metrics.update-target.missing_target", message: "Meta não informada." } };
  }

  const authz = await authorizeTargetConfigActor(input.targetId);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return updateTarget({ ...input, actorId: authz.actorId });
}
