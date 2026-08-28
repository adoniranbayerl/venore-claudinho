import type { OperationResult } from "@/shared/types";
import type {
  MetricAggregation,
  MetricDefinitionGranularity,
  MetricDefinitionRecord,
  MetricDirection,
  MetricUnit,
} from "../../../contracts/types";

export type CreateMetricDefinitionCommand = {
  sectorId: string;
  groupId?: string | null;
  label: string;
  description?: string | null;
  unit: MetricUnit;
  aggregation: MetricAggregation;
  granularity: MetricDefinitionGranularity;
  direction: MetricDirection;
  actorId: string;
};

export type CreateMetricDefinitionInput = Omit<CreateMetricDefinitionCommand, "actorId">;
export type CreateMetricDefinitionResult = OperationResult<MetricDefinitionRecord>;
