// Coração do cálculo de meta (§2.2). PURO — sem I/O. O service resolve os valores das definições
// no banco e chama estas funções; a UI (admin, visualização interativa, TV) só renderiza o
// resultado.

import type { MetricAggregation, TargetClassification, TargetRollup } from "../contracts/types";

// Consolida os valores de vários períodos de UMA definição num único número, conforme a
// aggregation dela. `values` já vem ordenado por período crescente.
export function aggregateValues(values: number[], aggregation: MetricAggregation): number {
  if (values.length === 0) return 0;
  if (aggregation === "last") return values[values.length - 1];
  const sum = values.reduce((total, value) => total + value, 0);
  if (aggregation === "average") return sum / values.length;
  return sum;
}

export type RollupInputLine = {
  classification: TargetClassification;
  weight: number;
  // Valor já consolidado da definição no período da meta (aggregateValues acima).
  resolvedValue: number;
};

export type TargetRollupInput = {
  targetValue: number;
  onTrackThreshold: number;
  lines: RollupInputLine[];
};

function sumBy(lines: RollupInputLine[], classification: TargetClassification): number {
  return lines
    .filter((line) => line.classification === classification)
    .reduce((total, line) => total + line.resolvedValue * line.weight, 0);
}

export function rollupTarget(input: TargetRollupInput): TargetRollup {
  const realized = sumBy(input.lines, "realized");
  const atRisk = sumBy(input.lines, "at_risk");
  const projected = sumBy(input.lines, "projected");
  const subtract = sumBy(input.lines, "subtract");

  const headline = realized;
  const optimistic = realized + atRisk + projected - subtract;
  const gap = input.targetValue - headline;

  const completion = input.targetValue > 0 ? headline / input.targetValue : 0;
  const optimisticCompletion = input.targetValue > 0 ? optimistic / input.targetValue : 0;

  const threshold = Number.isFinite(input.onTrackThreshold) ? input.onTrackThreshold : 0.85;
  let status: TargetRollup["status"];
  if (completion >= 1) status = "met";
  else if (completion >= threshold) status = "on_track";
  else status = "below";

  return {
    targetValue: input.targetValue,
    realized,
    atRisk,
    projected,
    subtract,
    headline,
    optimistic,
    gap,
    completion,
    optimisticCompletion,
    status,
  };
}
