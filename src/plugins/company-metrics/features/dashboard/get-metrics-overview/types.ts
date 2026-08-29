import type { OperationResult } from "@/shared/types";
import type { SectorRecord, TargetRollupStatus } from "../../../contracts/types";

export type SectorOverview = {
  sector: SectorRecord;
  targetCount: number;
  statusCounts: Record<TargetRollupStatus, number>;
  // Média simples da conclusão (headline) das metas do setor, 0-1. null quando não há meta.
  averageCompletion: number | null;
  lastUpdatedAt: Date | null;
};

export type MetricsOverview = {
  sectors: SectorOverview[];
};

export type GetMetricsOverviewResult = OperationResult<MetricsOverview>;
