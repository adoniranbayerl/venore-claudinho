import { authorizeSectorGroupConfigActor } from "../../../shared/scoped-authorization";
import { updateSectorGroup } from "./service";
import type { UpdateSectorGroupInput, UpdateSectorGroupResult } from "./types";

export async function updateSectorGroupHandler(input: UpdateSectorGroupInput): Promise<UpdateSectorGroupResult> {
  if (!input.groupId || input.groupId.trim().length === 0) {
    return { success: false, error: { code: "company-metrics.update-sector-group.missing_group", message: "Grupo não informado." } };
  }

  const authz = await authorizeSectorGroupConfigActor(input.groupId);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return updateSectorGroup({ ...input, actorId: authz.actorId });
}
