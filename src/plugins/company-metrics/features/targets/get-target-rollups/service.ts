import type { TargetRollupLine, TargetRollupView } from "../../../contracts/types";
import { aggregateValues, rollupTarget } from "../../../shared/metric-rollup";
import {
  findDefinitionsByIds,
  findInputsForTargets,
  findSectorTargets,
  findValuesForDefinitionsInRange,
} from "./store";
import type { GetTargetRollupsResult } from "./types";

// Monta o view model de cada meta do setor: valores consolidados por definição no período da
// meta + o TargetRollup. Reusado pela visualização interativa (Fase 4) e pela TV (Fase 5).
export async function getTargetRollups(sectorId: string): Promise<GetTargetRollupsResult> {
  const targets = await findSectorTargets(sectorId);
  if (targets.length === 0) {
    return { success: true, data: [] };
  }

  const inputs = await findInputsForTargets(targets.map((target) => target.id));
  const definitionIds = [...new Set(inputs.map((input) => input.definitionId))];
  const definitions = await findDefinitionsByIds(definitionIds);
  const definitionById = new Map(definitions.map((definition) => [definition.id, definition]));

  const overallFrom = targets.reduce((min, target) => (target.periodStart < min ? target.periodStart : min), targets[0].periodStart);
  const overallTo = targets.reduce((max, target) => (target.periodEnd > max ? target.periodEnd : max), targets[0].periodEnd);
  const values = await findValuesForDefinitionsInRange(definitionIds, overallFrom, overallTo);

  const inputsByTarget = new Map<string, typeof inputs>();
  for (const input of inputs) {
    const list = inputsByTarget.get(input.targetId) ?? [];
    list.push(input);
    inputsByTarget.set(input.targetId, list);
  }

  const data: TargetRollupView[] = targets.map((target) => {
    const targetInputs = inputsByTarget.get(target.id) ?? [];
    const lines: TargetRollupLine[] = targetInputs.map((input) => {
      const definition = definitionById.get(input.definitionId);
      const periodValues = values
        .filter(
          (value) =>
            value.definitionId === input.definitionId &&
            value.periodStart >= target.periodStart &&
            value.periodStart <= target.periodEnd,
        )
        .map((value) => value.value);
      const resolvedValue = definition ? aggregateValues(periodValues, definition.aggregation) : 0;
      return {
        definitionId: input.definitionId,
        label: definition?.label ?? "métrica removida",
        classification: input.classification,
        weight: input.weight,
        resolvedValue,
      };
    });

    const rollup = rollupTarget({
      targetValue: target.targetValue,
      onTrackThreshold: target.onTrackThreshold,
      lines: lines.map((line) => ({
        classification: line.classification,
        weight: line.weight,
        resolvedValue: line.resolvedValue,
      })),
    });

    return { target, lines, rollup };
  });

  return { success: true, data };
}
