import { authorizeMetricDefinitionConfigActor } from "../../../shared/scoped-authorization";
import { updateMetricDefinition } from "./service";
import type { UpdateMetricDefinitionInput, UpdateMetricDefinitionResult } from "./types";

export async function updateMetricDefinitionHandler(
  input: UpdateMetricDefinitionInput,
): Promise<UpdateMetricDefinitionResult> {
  if (!input.definitionId || input.definitionId.trim().length === 0) {
    return { success: false, error: { code: "company-metrics.update-metric-definition.missing_definition", message: "Métrica não informada." } };
  }

  const authz = await authorizeMetricDefinitionConfigActor(input.definitionId);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return updateMetricDefinition({ ...input, actorId: authz.actorId });
}
