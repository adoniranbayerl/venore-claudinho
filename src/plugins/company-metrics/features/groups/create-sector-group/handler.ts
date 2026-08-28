import { authorizeSectorConfigActor } from "../../../shared/scoped-authorization";
import { createSectorGroup } from "./service";
import { validateCreateSectorGroupInput } from "./validation";
import type { CreateSectorGroupInput, CreateSectorGroupResult } from "./types";

export async function createSectorGroupHandler(input: CreateSectorGroupInput): Promise<CreateSectorGroupResult> {
  const validationError = validateCreateSectorGroupInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeSectorConfigActor(input.sectorId);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createSectorGroup({ ...input, actorId: authz.actorId });
}
