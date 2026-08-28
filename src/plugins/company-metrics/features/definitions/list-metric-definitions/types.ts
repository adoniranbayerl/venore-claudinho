import type { OperationResult } from "@/shared/types";
import type { MetricDefinitionRecord } from "../../../contracts/types";

export type ListMetricDefinitionsResult = OperationResult<MetricDefinitionRecord[]>;
