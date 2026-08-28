import { authorizeSectorConfigActor } from "../../../shared/scoped-authorization";
import { createTarget } from "./service";
import type { CreateTargetInput, CreateTargetResult } from "./types";

export async function createTargetHandler(input: CreateTargetInput): Promise<CreateTargetResult> {
  if (!input.sectorId || input.sectorId.trim().length === 0) {
    return { success: false, error: { code: "company-metrics.create-target.missing_sector", message: "Setor não informado." } };
  }

  const authz = await authorizeSectorConfigActor(input.sectorId);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createTarget({ ...input, actorId: authz.actorId });
}
