import type { OperationResult } from "@/shared/types";
import type { MetricDefinitionRecord, MetricDirection, MetricUnit } from "../../../contracts/types";

// granularity NÃO é editável — mudá-la reorganizaria os buckets dos valores já lançados.
export type UpdateMetricDefinitionCommand = {
  definitionId: string;
  label: string;
  description?: string | null;
  groupId?: string | null;
  unit: MetricUnit;
  direction: MetricDirection;
  actorId: string;
};

export type UpdateMetricDefinitionInput = Omit<UpdateMetricDefinitionCommand, "actorId">;
export type UpdateMetricDefinitionResult = OperationResult<MetricDefinitionRecord>;
