import type { OperationResult } from "@/shared/types";
import type { MetricValueRecord } from "../../../contracts/types";

export type UpsertMetricValueCommand = {
  definitionId: string;
  // Qualquer data "YYYY-MM-DD" dentro do período — o service normaliza pro início do bucket
  // conforme a granularity da definição.
  periodDate: string;
  // null limpa o lançamento daquele período (remove a linha).
  value: number | null;
  note?: string | null;
  actorId: string;
};

export type UpsertMetricValueInput = Omit<UpsertMetricValueCommand, "actorId">;
export type UpsertMetricValueResult = OperationResult<{
  definitionId: string;
  periodStart: string;
  value: MetricValueRecord | null;
}>;
