import type { OperationResult } from "@/shared/types";

// Superfície pública mínima para outro plugin (Broadcast, §9.3) montar um seletor de painel sem
// colar URL. Só rótulo + token (o token já é a credencial pública da URL da TV).
export type MetricsBoardRef = { token: string; label: string };
export type ListMetricsBoardsResult = OperationResult<MetricsBoardRef[]>;
