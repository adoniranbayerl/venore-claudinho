import { authorizeMetricDefinitionConfigActor } from "../../../shared/scoped-authorization";
import { archiveMetricDefinition } from "./service";
import type { ArchiveMetricDefinitionInput, ArchiveMetricDefinitionResult } from "./types";

export async function archiveMetricDefinitionHandler(
  input: ArchiveMetricDefinitionInput,
): Promise<ArchiveMetricDefinitionResult> {
  if (!input.definitionId || input.definitionId.trim().length === 0) {
    return { success: false, error: { code: "company-metrics.archive-metric-definition.missing_definition", message: "Métrica não informada." } };
  }

  const authz = await authorizeMetricDefinitionConfigActor(input.definitionId);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return archiveMetricDefinition({ ...input, actorId: authz.actorId });
}
