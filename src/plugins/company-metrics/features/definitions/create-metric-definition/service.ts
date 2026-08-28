import { beginOperation, endOperation } from "@/observability";
import { slugify } from "../../../shared/slugify";
import {
  definitionKeyExists,
  groupBelongsToSector,
  insertMetricDefinition,
  nextDefinitionPosition,
  sectorExists,
} from "./store";
import type { CreateMetricDefinitionCommand, CreateMetricDefinitionResult } from "./types";

async function uniqueDefinitionKey(sectorId: string, label: string): Promise<string> {
  const base = slugify(label) || "metrica";
  let candidate = base;
  let attempt = 1;
  while (await definitionKeyExists(sectorId, candidate)) {
    attempt += 1;
    candidate = `${base}-${attempt}`;
  }
  return candidate;
}

export async function createMetricDefinition(
  command: CreateMetricDefinitionCommand,
): Promise<CreateMetricDefinitionResult> {
  if (!(await sectorExists(command.sectorId))) {
    return { success: false, error: { code: "company-metrics.create-metric-definition.sector_not_found", message: "Setor não encontrado." } };
  }

  const groupId = command.groupId?.trim() || null;
  if (groupId && !(await groupBelongsToSector(groupId, command.sectorId))) {
    return { success: false, error: { code: "company-metrics.create-metric-definition.group_mismatch", message: "O grupo escolhido não é deste setor." } };
  }

  const handle = beginOperation({
    useCase: "company-metrics.create-metric-definition",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const [key, position] = await Promise.all([
    uniqueDefinitionKey(command.sectorId, command.label),
    nextDefinitionPosition(command.sectorId),
  ]);

  const record = await insertMetricDefinition({
    sectorId: command.sectorId,
    groupId,
    key,
    label: command.label.trim(),
    description: command.description?.trim() || null,
    unit: command.unit,
    aggregation: command.aggregation,
    granularity: command.granularity,
    direction: command.direction,
    position,
  });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
