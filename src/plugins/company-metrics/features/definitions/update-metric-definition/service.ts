import { beginOperation, endOperation } from "@/observability";
import { METRIC_DIRECTIONS, METRIC_UNITS } from "../../../contracts/types";
import { findDefinitionById, groupBelongsToSector, updateMetricDefinitionRow } from "./store";
import type { UpdateMetricDefinitionCommand, UpdateMetricDefinitionResult } from "./types";

export async function updateMetricDefinition(
  command: UpdateMetricDefinitionCommand,
): Promise<UpdateMetricDefinitionResult> {
  const existing = await findDefinitionById(command.definitionId);
  if (!existing) {
    return { success: false, error: { code: "company-metrics.update-metric-definition.not_found", message: "Métrica não encontrada." } };
  }
  if (command.label.trim().length === 0) {
    return { success: false, error: { code: "company-metrics.update-metric-definition.invalid_label", message: "O nome da métrica não pode ser vazio." } };
  }
  if (!(METRIC_UNITS as readonly string[]).includes(command.unit)) {
    return { success: false, error: { code: "company-metrics.update-metric-definition.invalid_unit", message: "Unidade inválida." } };
  }
  if (!(METRIC_DIRECTIONS as readonly string[]).includes(command.direction)) {
    return { success: false, error: { code: "company-metrics.update-metric-definition.invalid_direction", message: "Direção inválida." } };
  }

  const groupId = command.groupId?.trim() || null;
  if (groupId && !(await groupBelongsToSector(groupId, existing.sectorId))) {
    return { success: false, error: { code: "company-metrics.update-metric-definition.group_mismatch", message: "O grupo escolhido não é deste setor." } };
  }

  const handle = beginOperation({
    useCase: "company-metrics.update-metric-definition",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const record = await updateMetricDefinitionRow(command.definitionId, {
    label: command.label.trim(),
    description: command.description?.trim() || null,
    groupId,
    unit: command.unit,
    direction: command.direction,
  });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
