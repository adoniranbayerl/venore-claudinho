import { authorizeSectorConfigActor } from "../../../shared/scoped-authorization";
import { createMetricDefinition } from "./service";
import { validateCreateMetricDefinitionInput } from "./validation";
import type { CreateMetricDefinitionInput, CreateMetricDefinitionResult } from "./types";

export async function createMetricDefinitionHandler(
  input: CreateMetricDefinitionInput,
): Promise<CreateMetricDefinitionResult> {
  const validationError = validateCreateMetricDefinitionInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeSectorConfigActor(input.sectorId);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createMetricDefinition({ ...input, actorId: authz.actorId });
}
