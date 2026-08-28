import { authorizeSectorGroupConfigActor } from "../../../shared/scoped-authorization";
import { deleteSectorGroup } from "./service";
import type { DeleteSectorGroupInput, DeleteSectorGroupResult } from "./types";

export async function deleteSectorGroupHandler(input: DeleteSectorGroupInput): Promise<DeleteSectorGroupResult> {
  if (!input.groupId || input.groupId.trim().length === 0) {
    return { success: false, error: { code: "company-metrics.delete-sector-group.missing_group", message: "Grupo não informado." } };
  }

  const authz = await authorizeSectorGroupConfigActor(input.groupId);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return deleteSectorGroup({ ...input, actorId: authz.actorId });
}
