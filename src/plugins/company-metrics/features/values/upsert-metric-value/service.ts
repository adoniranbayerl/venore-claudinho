import { beginOperation, endOperation } from "@/observability";
import { bucketStart, isValidCivilDate } from "../../../shared/period";
import { deleteMetricValue, findDefinitionById, upsertMetricValue } from "./store";
import type { UpsertMetricValueCommand, UpsertMetricValueResult } from "./types";

export async function upsertMetricValueForPeriod(command: UpsertMetricValueCommand): Promise<UpsertMetricValueResult> {
  const definition = await findDefinitionById(command.definitionId);
  if (!definition) {
    return { success: false, error: { code: "company-metrics.upsert-metric-value.definition_not_found", message: "Métrica não encontrada." } };
  }
  if (definition.archivedAt) {
    return { success: false, error: { code: "company-metrics.upsert-metric-value.definition_archived", message: "Esta métrica está arquivada." } };
  }
  if (!isValidCivilDate(command.periodDate)) {
    return { success: false, error: { code: "company-metrics.upsert-metric-value.invalid_period", message: "Data de período inválida." } };
  }
  if (command.value !== null && !Number.isFinite(command.value)) {
    return { success: false, error: { code: "company-metrics.upsert-metric-value.invalid_value", message: "Valor inválido." } };
  }

  const periodStart = bucketStart(command.periodDate, definition.granularity);

  const handle = beginOperation({
    useCase: "company-metrics.upsert-metric-value",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  if (command.value === null) {
    await deleteMetricValue(command.definitionId, periodStart);
    endOperation(handle, { success: true });
    return { success: true, data: { definitionId: command.definitionId, periodStart, value: null } };
  }

  const record = await upsertMetricValue({
    definitionId: command.definitionId,
    periodStart,
    value: command.value,
    note: command.note?.trim() || null,
    enteredByUserId: command.actorId,
  });

  endOperation(handle, { success: true });
  return { success: true, data: { definitionId: command.definitionId, periodStart, value: record } };
}
