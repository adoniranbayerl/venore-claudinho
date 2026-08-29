import type { OperationResult } from "@/shared/types";
import type { MetricDefinitionRecord, SectorRecord, TargetRollupView } from "../../../contracts/types";

export type MetricSeriesPoint = { periodStart: string; value: number };

export type MetricSeries = {
  definition: MetricDefinitionRecord;
  points: MetricSeriesPoint[];
};

export type SectorDashboard = {
  sector: SectorRecord;
  windowMonths: number;
  targets: TargetRollupView[];
  metrics: MetricSeries[];
  // Instante do lançamento mais recente do setor (qualquer métrica) — null se nunca lançaram.
  lastUpdatedAt: Date | null;
};

export type GetSectorDashboardResult = OperationResult<SectorDashboard>;
