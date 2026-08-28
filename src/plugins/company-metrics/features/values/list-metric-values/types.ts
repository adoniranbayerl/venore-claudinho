import type { OperationResult } from "@/shared/types";
import type { MetricValueRecord } from "../../../contracts/types";

export type ListMetricValuesQuery = {
  sectorId?: string;
  definitionIds?: string[];
  // Intervalo civil "YYYY-MM-DD" inclusive (comparado contra period_start).
  from: string;
  to: string;
};

export type ListMetricValuesResult = OperationResult<MetricValueRecord[]>;
