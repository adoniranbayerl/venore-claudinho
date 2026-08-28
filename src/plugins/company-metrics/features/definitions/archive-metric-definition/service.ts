import { beginOperation, endOperation } from "@/observability";
import { findDefinitionById, setDefinitionArchivedAt } from "./store";
import type { ArchiveMetricDefinitionCommand, ArchiveMetricDefinitionResult } from "./types";

// Arquivar (soft) — os metric_values ficam no banco, só somem das listagens e dos painéis.
export async function archiveMetricDefinition(
  command: ArchiveMetricDefinitionCommand,
): Promise<ArchiveMetricDefinitionResult> {
  const existing = await findDefinitionById(command.definitionId);
  if (!existing) {
    return { success: false, error: { code: "company-metrics.archive-metric-definition.not_found", message: "Métrica não encontrada." } };
  }

  const handle = beginOperation({
    useCase: "company-metrics.archive-metric-definition",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const record = await setDefinitionArchivedAt(command.definitionId, command.archived ? new Date() : null);

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
