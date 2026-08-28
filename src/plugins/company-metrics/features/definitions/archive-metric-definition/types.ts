import type { OperationResult } from "@/shared/types";
import type { MetricDefinitionRecord } from "../../../contracts/types";

export type ArchiveMetricDefinitionCommand = { definitionId: string; archived: boolean; actorId: string };
export type ArchiveMetricDefinitionInput = Omit<ArchiveMetricDefinitionCommand, "actorId">;
export type ArchiveMetricDefinitionResult = OperationResult<MetricDefinitionRecord>;
