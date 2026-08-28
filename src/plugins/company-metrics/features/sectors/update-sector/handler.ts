import { authorizeSectorConfigActor } from "../../../shared/scoped-authorization";
import { updateSector } from "./service";
import { validateUpdateSectorInput } from "./validation";
import type { UpdateSectorInput, UpdateSectorResult } from "./types";

// Editar metadados do setor = configuração: company-metrics.manage OU papel "admin" no próprio
// setor (ver shared/scoped-authorization).
export async function updateSectorHandler(input: UpdateSectorInput): Promise<UpdateSectorResult> {
  const validationError = validateUpdateSectorInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeSectorConfigActor(input.sectorId);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return updateSector({ ...input, actorId: authz.actorId });
}
